fetch('https://euwckzpwmvbzliifcmyp.supabase.co/functions/v1/hotmart-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-HOTMART-HOTTOK': '3pFMzO7aQO1p8x6YOyF0aUqC848IRJ3854fa0c-244b-4369-9d28-f693faa20a8b'
  },
  body: JSON.stringify({ event: 'PURCHASE_APPROVED', data: { buyer: { email: 'test@test.com' } } })
}).then(r => r.json().then(b => console.log(r.status, b)));
