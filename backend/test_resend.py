"""
Test script to verify Resend API is working correctly
"""
import os
import resend

# Test with the API key
API_KEY = "re_erWoJxGU_8fpmWrjAxhCXNuSsp42zE4uz"

print("=" * 60)
print("RESEND API TEST")
print("=" * 60)
print(f"\n1. API Key (first 10 chars): {API_KEY[:10]}...")
print(f"   API Key length: {len(API_KEY)}")

# Set the API key
resend.api_key = API_KEY
print("\n2. ✓ API key set in resend module")

# Prepare test email
test_email = {
    "from": "onboarding@resend.dev",
    "to": ["parvejrafi80@gmail.com"],
    "subject": "🧪 Test Email from SecureCrop - Password Reset System",
    "html": """
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Test Email - SecureCrop System</h2>
        <p>This is a test email to verify the Resend API integration is working correctly.</p>
        <p>If you receive this email, it means:</p>
        <ul>
            <li>✅ API key is valid</li>
            <li>✅ Email sending works</li>
            <li>✅ From address (onboarding@resend.dev) is verified</li>
        </ul>
        <p style="margin-top: 30px; color: #666;">
            <small>This is an automated test from SecureCrop Password Reset System</small>
        </p>
    </div>
    """
}

print("\n3. Email parameters prepared:")
print(f"   From: {test_email['from']}")
print(f"   To: {test_email['to'][0]}")
print(f"   Subject: {test_email['subject']}")

# Try to send email
print("\n4. Attempting to send email...")
try:
    result = resend.Emails.send(test_email)
    print("\n✅ SUCCESS! Email sent successfully!")
    print(f"   Result: {result}")
    print("\n" + "=" * 60)
    print("✅ RESEND API IS WORKING PERFECTLY!")
    print("=" * 60)
    print("\n📧 Check your inbox: cyberhackrafi@gmail.com")
    print("   (Also check spam folder)")
    
except Exception as e:
    print(f"\n❌ ERROR: {type(e).__name__}")
    print(f"   Message: {str(e)}")
    print("\n" + "=" * 60)
    print("❌ RESEND API TEST FAILED")
    print("=" * 60)
    
    # Provide specific guidance based on error
    error_msg = str(e).lower()
    if "invalid" in error_msg or "api key" in error_msg:
        print("\n🔍 DIAGNOSIS: API Key Issue")
        print("   - The API key might be incorrect")
        print("   - Check: https://resend.com/api-keys")
        print("   - Verify the key hasn't been revoked")
    elif "not verified" in error_msg or "domain" in error_msg:
        print("\n🔍 DIAGNOSIS: Email Address Issue")
        print("   - Use: onboarding@resend.dev (pre-verified)")
        print("   - Or verify your custom domain in Resend")
    else:
        print("\n🔍 DIAGNOSIS: Unknown Error")
        print("   - Check Resend status: https://resend.com/status")
        print(f"   - Error details: {e}")

print("\n")
