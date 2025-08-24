# Dada Aro Care - Customer Service Platform

A comprehensive customer service management platform with automated messaging, service reminders, and review capabilities.

## 🚀 Features

- **Customer Management**: Complete customer database with service records
- **Automated Messaging**: WhatsApp and SMS integration with personalized templates
- **Service Reviews**: Customer feedback platform with rating analytics
- **Filter Management**: Track filter changes with customizable reminder periods
- **Dashboard Analytics**: Real-time statistics and insights
- **Notification Settings**: Comprehensive configuration for automated messaging

## 📱 Messaging Integration

### WhatsApp & SMS Gateway Setup

The platform uses **Twilio** for both WhatsApp and SMS messaging. You need to configure the following environment variables:

#### Required Environment Variables

Add these to your Supabase Edge Functions environment:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number for SMS
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Twilio WhatsApp sandbox number
```

#### How to Get Twilio Credentials

1. **Sign up for Twilio**: Go to [twilio.com](https://www.twilio.com) and create an account
2. **Get Account SID & Auth Token**: 
   - Go to Console Dashboard
   - Copy your Account SID and Auth Token
3. **Get Phone Number**: 
   - Go to Phone Numbers → Manage → Buy a number
   - Choose a number for SMS messaging
4. **WhatsApp Setup**:
   - Go to Messaging → Try it out → Send a WhatsApp message
   - Use the sandbox number: `whatsapp:+14155238886`
   - For production, apply for WhatsApp Business API approval

#### Alternative SMS Providers

You can also integrate other SMS providers by modifying the edge functions:

**TextLocal (India)**:
```javascript
// Add to environment variables
TEXTLOCAL_API_KEY=your_textlocal_api_key
TEXTLOCAL_SENDER=your_sender_name
```

**MSG91 (India)**:
```javascript
// Add to environment variables
MSG91_API_KEY=your_msg91_api_key
MSG91_SENDER_ID=your_sender_id
MSG91_ROUTE=4  // Transactional route
```

**AWS SNS**:
```javascript
// Add to environment variables
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
```

### Setting Up Environment Variables in Supabase

1. Go to your Supabase project dashboard
2. Navigate to Settings → Edge Functions
3. Add the environment variables in the "Environment Variables" section
4. Deploy the edge functions

### Message Features

- **Personalization**: Use placeholders like `[NAME]`, `[PHONE]`, `[FILTER_TYPE]`
- **Bulk Messaging**: Send to multiple customers at once
- **Scheduling**: Schedule messages for future delivery
- **Delivery Status**: Track message delivery status
- **Rate Limiting**: Built-in delays to avoid provider limits

### Message Templates

Create templates for different scenarios:
- **Birthday Messages**: Personalized birthday wishes
- **Welcome Messages**: New customer onboarding
- **Filter Reminders**: Service due notifications
- **Guarantee Notifications**: Warranty expiry alerts
- **Promotional Messages**: Marketing campaigns
- **Loan Messages**: Payment reminders

## 🛠️ Installation & Setup

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Connect to Supabase**: Click "Connect to Supabase" button
4. **Configure messaging**: Add Twilio credentials to Supabase environment
5. **Run the application**: `npm run dev`

## 📊 Database Schema

- **customers**: Customer profiles and service history
- **message_templates**: Customizable message templates
- **scheduled_messages**: Message scheduling and delivery tracking
- **service_reviews**: Customer feedback and ratings
- **notification_settings**: Automated messaging configuration
- **filter_changes**: Service history and maintenance records

## 🔧 Usage

### Sending Messages

1. **Compose Tab**: 
   - Select message type and template
   - Choose recipients (All, Birthday Today, Filter Due)
   - Select WhatsApp or SMS
   - Send immediately or schedule for later

2. **Scheduled Messages Tab**:
   - View all scheduled messages
   - Edit or delete scheduled messages
   - Track delivery status

### Customer Management

- Add new customers with complete profiles
- Track service history and filter changes
- Manage guarantee periods and expiry dates
- Search and filter customer database

### Analytics

- Real-time dashboard with key metrics
- Customer birthday tracking
- Filter change due alerts
- Message delivery statistics
- Service review analytics

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Secure API endpoints with authentication
- Environment variable protection
- Rate limiting on message sending

## 📞 Support

For technical support or feature requests, please contact the development team.

---

**Dada Aro Care** - Providing excellent customer service through technology 💦