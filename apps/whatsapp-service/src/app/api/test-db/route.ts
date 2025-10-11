import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@snkhouse/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: []
  };

  try {
    // Check 1: Environment variables
    console.log('[Test DB] Checking environment variables...');
    const envCheck: any = {
      name: 'Environment Variables',
      status: 'checking'
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      envCheck.status = 'failed';
      envCheck.error = 'NEXT_PUBLIC_SUPABASE_URL not set';
      results.checks.push(envCheck);
      return NextResponse.json(results, { status: 500 });
    }

    if (!supabaseKey) {
      envCheck.status = 'failed';
      envCheck.error = 'SUPABASE_SERVICE_ROLE_KEY not set';
      results.checks.push(envCheck);
      return NextResponse.json(results, { status: 500 });
    }

    envCheck.status = 'passed';
    envCheck.details = {
      urlLength: supabaseUrl.length,
      keyLength: supabaseKey.length,
      urlDomain: new URL(supabaseUrl).hostname
    };
    results.checks.push(envCheck);

    // Check 2: Supabase client
    console.log('[Test DB] Verifying Supabase client...');
    const clientCheck: any = {
      name: 'Supabase Client',
      status: 'checking'
    };

    if (!supabaseAdmin) {
      clientCheck.status = 'failed';
      clientCheck.error = 'Supabase admin client is not initialized';
      results.checks.push(clientCheck);
      return NextResponse.json(results, { status: 500 });
    }

    clientCheck.status = 'passed';
    results.checks.push(clientCheck);

    // Check 3: Query customers table
    console.log('[Test DB] Testing customers table query...');
    const customersCheck: any = {
      name: 'Customers Table Query',
      status: 'checking'
    };

    const customersStart = Date.now();
    const { data: customers, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('id, phone, created_at')
      .limit(1);

    customersCheck.duration = Date.now() - customersStart;

    if (customersError) {
      customersCheck.status = 'failed';
      customersCheck.error = {
        message: customersError.message,
        code: customersError.code,
        details: customersError.details,
        hint: customersError.hint
      };
    } else {
      customersCheck.status = 'passed';
      customersCheck.details = {
        rowsReturned: customers?.length || 0,
        hasData: (customers?.length || 0) > 0
      };
    }
    results.checks.push(customersCheck);

    // Check 4: Query conversations table
    console.log('[Test DB] Testing conversations table query...');
    const conversationsCheck: any = {
      name: 'Conversations Table Query',
      status: 'checking'
    };

    const conversationsStart = Date.now();
    const { data: conversations, error: conversationsError } = await supabaseAdmin
      .from('conversations')
      .select('id, customer_id, channel, status, created_at')
      .limit(1);

    conversationsCheck.duration = Date.now() - conversationsStart;

    if (conversationsError) {
      conversationsCheck.status = 'failed';
      conversationsCheck.error = {
        message: conversationsError.message,
        code: conversationsError.code,
        details: conversationsError.details,
        hint: conversationsError.hint
      };
    } else {
      conversationsCheck.status = 'passed';
      conversationsCheck.details = {
        rowsReturned: conversations?.length || 0,
        hasData: (conversations?.length || 0) > 0
      };
    }
    results.checks.push(conversationsCheck);

    // Check 5: Query messages table
    console.log('[Test DB] Testing messages table query...');
    const messagesCheck: any = {
      name: 'Messages Table Query',
      status: 'checking'
    };

    const messagesStart = Date.now();
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('id, conversation_id, role, created_at')
      .limit(1);

    messagesCheck.duration = Date.now() - messagesStart;

    if (messagesError) {
      messagesCheck.status = 'failed';
      messagesCheck.error = {
        message: messagesError.message,
        code: messagesError.code,
        details: messagesError.details,
        hint: messagesError.hint
      };
    } else {
      messagesCheck.status = 'passed';
      messagesCheck.details = {
        rowsReturned: messages?.length || 0,
        hasData: (messages?.length || 0) > 0
      };
    }
    results.checks.push(messagesCheck);

    // Check 6: Test INSERT capability (dry run with rollback)
    console.log('[Test DB] Testing INSERT capability...');
    const insertCheck: any = {
      name: 'Database Write Test',
      status: 'checking'
    };

    try {
      const insertStart = Date.now();

      // Try to insert a test customer
      const testPhone = `+test${Date.now()}`;
      const { data: testCustomer, error: insertError } = await supabaseAdmin
        .from('customers')
        .insert({
          phone: testPhone,
          whatsapp_name: 'Test Customer (will be deleted)',
        })
        .select()
        .single();

      insertCheck.insertDuration = Date.now() - insertStart;

      if (insertError) {
        insertCheck.status = 'failed';
        insertCheck.error = {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details
        };
      } else if (testCustomer) {
        // Clean up test data
        const deleteStart = Date.now();
        await supabaseAdmin
          .from('customers')
          .delete()
          .eq('id', testCustomer.id);

        insertCheck.deleteDuration = Date.now() - deleteStart;
        insertCheck.status = 'passed';
        insertCheck.details = {
          testCustomerId: testCustomer.id,
          insertTime: insertCheck.insertDuration,
          deleteTime: insertCheck.deleteDuration
        };
      }
    } catch (insertTestError: any) {
      insertCheck.status = 'failed';
      insertCheck.error = {
        message: insertTestError.message,
        type: 'exception'
      };
    }

    results.checks.push(insertCheck);

    // Summary
    results.summary = {
      total: results.checks.length,
      passed: results.checks.filter((c: any) => c.status === 'passed').length,
      failed: results.checks.filter((c: any) => c.status === 'failed').length,
      totalDuration: Date.now() - startTime
    };

    const allPassed = results.summary.failed === 0;

    console.log('[Test DB] Test completed:', results.summary);

    return NextResponse.json(results, {
      status: allPassed ? 200 : 500
    });

  } catch (error: any) {
    console.error('[Test DB] CRITICAL ERROR:', error);

    results.criticalError = {
      message: error.message,
      stack: error.stack?.substring(0, 1000)
    };
    results.summary = {
      total: results.checks.length,
      passed: results.checks.filter((c: any) => c.status === 'passed').length,
      failed: results.checks.filter((c: any) => c.status === 'failed').length,
      totalDuration: Date.now() - startTime
    };

    return NextResponse.json(results, { status: 500 });
  }
}
