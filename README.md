# Aro Care - Customer Service Platform

A comprehensive customer service management platform with automated WhatsApp messaging, service reminders, and review capabilities.

## 🚀 Features

- **Customer Management**: Complete customer database with service records
- **Automated WhatsApp Messaging**: Meta Business API integration with personalized templates
- **Service Reviews**: Customer feedback platform with rating analytics
- **Filter Management**: Track filter changes with customizable reminder periods
- **Dashboard Analytics**: Real-time statistics and insights
- **Automated Cron Jobs**: Daily messaging at 12:30 AM IST

## 📱 WhatsApp Integration

### Meta WhatsApp Business API Setup

The platform uses **Meta WhatsApp Business API** for professional messaging. You need to configure the following environment variables:

#### Required Environment Variables

Add these to your Supabase Edge Functions environment:

```bash
# Meta WhatsApp Business API Configuration
META_ACCESS_TOKEN=your_meta_access_token
META_PHONE_NUMBER_ID=your_phone_number_id
META_BUSINESS_ACCOUNT_ID=your_business_account_id
```

#### How to Get Meta WhatsApp Credentials

1. **Facebook Developer Account**: Go to [developers.facebook.com](https://developers.facebook.com)
2. **Create App**: Create a new Business app
3. **Add WhatsApp Product**: Add WhatsApp Business API to your app
4. **Get Phone Number ID**: From WhatsApp → API Setup
5. **Generate Access Token**: From App Settings → Basic
6. **Business Verification**: Complete business verification for production

#### WhatsApp Business API Features

- ✅ **Professional Messaging**: Business-grade WhatsApp integration
- ✅ **Rich Media Support**: Text, images, documents, and templates
- ✅ **Delivery Receipts**: Real-time message status tracking
- ✅ **Rate Limiting**: Automatic handling of API limits
- ✅ **Indian Phone Numbers**: Optimized for +91 country code

## 🕐 Automated Messaging Cron Job

### Daily Automation at 12:30 AM IST

The platform includes a powerful cron job that runs every night at 12:30 AM IST to send automated messages:

#### Automated Message Types

1. **Birthday Messages**
   - Automatically detects customers with birthdays today
   - Sends personalized birthday wishes
   - Uses active birthday message templates

2. **Filter Change Reminders**
   - Identifies customers with overdue filter changes
   - Sends service reminders based on `next_service` date
   - Helps maintain customer service schedules

3. **Guarantee Expiry Notifications**
   - Alerts customers 7 days before guarantee expiry
   - Helps with warranty management
   - Encourages service renewals

#### Cron Job Features

- ✅ **IST Timezone**: Runs at 12:30 AM Indian Standard Time
- ✅ **Smart Filtering**: Automatically identifies target customers
- ✅ **Template Integration**: Uses active message templates
- ✅ **Database Logging**: All messages logged in `scheduled_messages`
- ✅ **Error Handling**: Comprehensive error tracking and reporting
- ✅ **Bulk Processing**: Handles multiple customers efficiently

#### Setting Up Cron Job in Supabase

1. Go to Supabase Dashboard → Database → Cron
2. Create new cron job:
   ```sql
   SELECT cron.schedule(
     'automated-messaging',
     '30 19 * * *',  -- 12:30 AM IST (19:00 UTC)
     'SELECT net.http_post(
       url := ''https://your-project.supabase.co/functions/v1/automated-messaging-cron'',
       headers := ''{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}''::jsonb
     );'
   );
   ```

## 🛠️ Installation & Setup

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Connect to Supabase**: Click "Connect to Supabase" button
4. **Configure WhatsApp**: Add Meta API credentials to Supabase environment
5. **Set up Cron Job**: Configure automated messaging schedule
6. **Run the application**: `npm run dev`

## 📊 Database Schema

- **customers**: Customer profiles and service history
- **message_templates**: Customizable WhatsApp message templates
- **scheduled_messages**: Message scheduling and delivery tracking
- **service_reviews**: Customer feedback and ratings
- **notification_settings**: Automated messaging configuration
- **filter_changes**: Service history and maintenance records

## 🔧 Usage

### Sending WhatsApp Messages

1. **Compose Tab**: 
   - Select message type and template
   - Choose recipients (All, Birthday Today, Filter Due)
   - Send immediately or schedule for later

2. **Scheduled Messages Tab**:
   - View all scheduled WhatsApp messages
   - Edit or delete scheduled messages
   - Track delivery status

3. **Automated Messages**:
   - Birthday wishes sent automatically
   - Filter reminders for due services
   - Guarantee expiry notifications

### Customer Management

- Add new customers with complete profiles
- Track service history and filter changes
- Manage guarantee periods and expiry dates
- Search and filter customer database

### Analytics

- Real-time dashboard with key metrics
- Customer birthday tracking
- Filter change due alerts
- WhatsApp message delivery statistics
- Service review analytics

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Secure API endpoints with authentication
- Environment variable protection
- Rate limiting on message sending
- Meta Business API compliance

## 📞 Support

For technical support or feature requests, please contact the development team.

---

**Dada Aro Care** - Providing excellent customer service through WhatsApp automation 💬