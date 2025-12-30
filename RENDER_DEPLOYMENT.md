# SecuredCropSystem - Render Deployment Guide

## Prerequisites
- A [Render](https://render.com) account (free tier available)
- Your project code pushed to a GitHub repository
- API keys for external services (OpenWeather, Infobip, etc.)

## Step-by-Step Deployment Process

### 1. Prepare Your Repository

1. **Push your code to GitHub:**
   ```bash
   cd c:\Users\user\Desktop\SecuredCropSystem
   git init
   git add .
   git commit -m "Initial commit for Render deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/SecuredCropSystem.git
   git push -u origin main
   ```

### 2. Create PostgreSQL Database on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `securecrop-db` (or your preferred name)
   - **Database:** `securecrop` (or your preferred database name)
   - **User:** Will be auto-generated
   - **Region:** Choose closest to you (e.g., Oregon)
   - **Plan:** Free
4. Click **"Create Database"**
5. Wait for the database to be created (takes ~2 minutes)
6. **Save the Internal Database URL** - you'll need this later

### 3. Create Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Click **"Connect account"** if not already connected
   - Select your repository: `SecuredCropSystem`
3. Configure the service:
   - **Name:** `securecrop-backend` (or your preferred name)
   - **Region:** Same as database (e.g., Oregon)
   - **Branch:** `main`
   - **Root Directory:** `backend` (important!)
   - **Environment:** `Python 3`
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn securecrop.wsgi:application`
   - **Plan:** Free

### 4. Configure Environment Variables

In the **Environment Variables** section, add the following:

**Required Variables:**

| Key | Value | Notes |
|-----|-------|-------|
| `PYTHON_VERSION` | `3.11.0` | Python version to use |
| `SECRET_KEY` | Generate a secure key | Use: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | `False` | Must be False for production |
| `ALLOWED_HOSTS` | `your-app-name.onrender.com` | Your Render app URL |
| `DATABASE_URL` | Paste from database | Internal Database URL from step 2 |

**Optional Variables (add as needed):**

| Key | Value |
|-----|-------|
| `OPENWEATHER_API_KEY` | Your OpenWeather API key |
| `EMAIL_HOST_USER` | Your email address |
| `EMAIL_HOST_PASSWORD` | Your email app password |
| `INFOBIP_API_KEY` | Your Infobip API key |
| `INFOBIP_BASE_URL` | `https://api.infobip.com` |
| `INFOBIP_SENDER` | Your WhatsApp sender number |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend-domain.com` |

### 5. Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run the build script (install dependencies, collect static files, run migrations)
   - Start your application with gunicorn
3. Monitor the deployment logs
4. Wait for "Your service is live 🎉" message

### 6. Access Your Application

Your backend API will be available at:
```
https://your-app-name.onrender.com
```

Test the API:
```
https://your-app-name.onrender.com/api/
```

### 7. Create Superuser (Optional)

To create an admin user:

1. Go to your web service dashboard on Render
2. Click **"Shell"** tab
3. Run:
   ```bash
   python manage.py createsuperuser
   ```
4. Follow the prompts to create admin credentials

### 8. Access Django Admin

Visit:
```
https://your-app-name.onrender.com/admin/
```

## Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after inactivity takes ~50 seconds to wake up
- 750 hours/month free (enough for one service running 24/7)
- PostgreSQL database has 1GB storage limit

### Static Files
- Static files are served using WhiteNoise
- They're collected during build with `collectstatic`
- No need for separate CDN on free tier

### Database Backups
- Free tier doesn't include automatic backups
- Manually backup your database periodically:
  ```bash
  pg_dump -h <host> -U <user> -d <database> > backup.sql
  ```

### Logs
- View logs in the Render dashboard under the "Logs" tab
- Logs are retained for 7 days on free tier

### Environment Variables
- Can be updated anytime in the dashboard
- Service automatically redeploys when changed

## Troubleshooting

### Build Fails
- Check that `build.sh` has execute permissions
- Verify all dependencies in `requirements.txt` are compatible
- Review build logs for specific errors

### Application Won't Start
- Check `ALLOWED_HOSTS` includes your Render URL
- Verify `DATABASE_URL` is correctly set
- Check logs for startup errors

### Database Connection Issues
- Ensure `DATABASE_URL` uses the internal database URL
- Verify database is in the same region as web service
- Check database status in Render dashboard

### Static Files Not Loading
- Verify `collectstatic` ran successfully in build logs
- Check `STATIC_ROOT` setting in `settings.py`
- Ensure WhiteNoise middleware is configured

## Alternative: Deploy Using render.yaml (Blueprint)

Instead of manual setup, you can use the included `render.yaml`:

1. Push code to GitHub
2. In Render dashboard, click **"New +"** → **"Blueprint"**
3. Connect repository and select `backend/render.yaml`
4. Render will create both database and web service automatically
5. Add environment variables in the dashboard

## Updating Your Application

Render automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update application"
git push origin main
```

Render will automatically rebuild and redeploy.

## Need Help?

- [Render Documentation](https://render.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)
- Check Render logs for error messages
