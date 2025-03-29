# Making Your Film Recommendations App Accessible from Anywhere

This guide explains how to make your Film Recommendations application running on your homelab (192.168.1.10) accessible from anywhere on the internet.

## Step 1: Set Up Port Forwarding on Your Router

1. Access your router's admin interface by entering its IP address in your browser (typically 192.168.1.1 or similar)
2. Log in using your router's admin credentials
3. Find the "Port Forwarding" or "Virtual Server" section
4. Add the following port forwarding rules:
   - External Port 5173 → Internal IP 192.168.1.10, Internal Port 5173 (Frontend)
   - External Port 5291 → Internal IP 192.168.1.10, Internal Port 5291 (API)

## Step 2: Find Your Public IP Address

1. From any device on your home network, visit [whatismyip.com](https://www.whatismyip.com)
2. Note down your public IP address

## Step 3: Access Your Application from Anywhere

Your application will now be accessible from anywhere using:
- Frontend: http://YOUR_PUBLIC_IP:5173
- API: http://YOUR_PUBLIC_IP:5291
- Swagger UI: http://YOUR_PUBLIC_IP:5291/swagger

Replace YOUR_PUBLIC_IP with your actual public IP address from Step 2.

## Optional: Set Up Dynamic DNS (If Your Public IP Changes)

If your ISP changes your public IP address periodically:

1. Sign up for a free Dynamic DNS service like [No-IP](https://www.noip.com/), [DuckDNS](https://www.duckdns.org/), or [Dynu](https://www.dynu.com/)
2. Download their update client and install it on your homelab
3. Configure the client with your account credentials
4. Use the provided subdomain (e.g., yourname.duckdns.org) instead of your public IP

## Security Considerations

* By exposing your homelab to the internet, you're creating potential security risks
* Consider implementing additional security measures:
  * Enable HTTPS for secure connections
  * Set up a firewall on your homelab
  * Regularly update your application and system
  * Use strong passwords for all services

## Connecting to Your Application from Outside Your Home Network

If you're experiencing issues connecting from outside your home network:

1. Verify port forwarding is properly set up
2. Check if your ISP blocks incoming connections on these ports
3. Try using a VPN service if your ISP restricts incoming connections
4. Consider using a higher port number (e.g., 8173 instead of 5173) as some ISPs block common ports

Remember that your application will still be accessible locally at http://192.168.1.10:5173 even if external access is blocked by your ISP.
