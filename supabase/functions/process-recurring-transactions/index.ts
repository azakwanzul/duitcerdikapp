// Follow this setup guide to integrate the Deno runtime and Supabase functions in your project:
// https://deno.land/manual/getting_started/setup_your_environment

import { createClient } from "npm:@supabase/supabase-js@2.39.0";

interface RecurringTransaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  is_active: boolean;
  last_processed?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all active recurring transactions
    const { data: recurringTransactions, error: fetchError } = await supabase
      .from("recurring_transactions")
      .select("*")
      .eq("is_active", true);
    
    if (fetchError) {
      throw fetchError;
    }
    
    const now = new Date();
    const processedTransactions = [];
    
    // Process each recurring transaction
    for (const rt of recurringTransactions as RecurringTransaction[]) {
      const startDate = new Date(rt.start_date);
      const lastProcessed = rt.last_processed ? new Date(rt.last_processed) : null;
      
      // Skip if start date is in the future
      if (startDate > now) {
        continue;
      }
      
      let shouldProcess = false;
      
      // Determine if transaction should be processed based on frequency
      if (!lastProcessed) {
        // First time processing
        shouldProcess = true;
      } else {
        switch (rt.frequency) {
          case 'daily':
            // Process if last processed was yesterday or earlier
            const oneDayAgo = new Date(now);
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            shouldProcess = lastProcessed <= oneDayAgo;
            break;
            
          case 'weekly':
            // Process if last processed was 7 days ago or earlier
            const oneWeekAgo = new Date(now);
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            shouldProcess = lastProcessed <= oneWeekAgo;
            break;
            
          case 'monthly':
            // Process if last processed was in a previous month
            shouldProcess = 
              lastProcessed.getMonth() !== now.getMonth() || 
              lastProcessed.getFullYear() !== now.getFullYear();
            break;
        }
      }
      
      if (shouldProcess) {
        // Create a new transaction
        const { data: newTransaction, error: insertError } = await supabase
          .from("transactions")
          .insert({
            user_id: rt.user_id,
            type: rt.type,
            category: rt.category,
            amount: rt.amount,
            description: `${rt.description} (Recurring)`,
            date: now.toISOString().split('T')[0],
          })
          .select()
          .single();
        
        if (insertError) {
          console.error(`Error creating transaction for recurring transaction ${rt.id}:`, insertError);
          continue;
        }
        
        // Update the last_processed date
        const { error: updateError } = await supabase
          .from("recurring_transactions")
          .update({ last_processed: now.toISOString() })
          .eq("id", rt.id);
        
        if (updateError) {
          console.error(`Error updating last_processed for recurring transaction ${rt.id}:`, updateError);
          continue;
        }
        
        // Create a notification for the user
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            user_id: rt.user_id,
            type: "recurring_transaction",
            title: "Recurring Transaction Processed",
            message: `Your ${rt.frequency} ${rt.type} of ${rt.amount} for "${rt.description}" has been processed.`,
          });
        
        if (notificationError) {
          console.error(`Error creating notification for recurring transaction ${rt.id}:`, notificationError);
        }
        
        processedTransactions.push({
          id: rt.id,
          transaction_id: newTransaction.id,
          user_id: rt.user_id,
          description: rt.description,
          amount: rt.amount,
          type: rt.type,
        });
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: processedTransactions.length,
        transactions: processedTransactions,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  } catch (error) {
    console.error("Error processing recurring transactions:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  }
});