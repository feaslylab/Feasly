# Geo-blocking Configuration for Australian Traffic

## Cloudflare Rule Configuration

### Rule Details
- **Rule Name**: Block Australian Traffic
- **Expression**: `(ip.geoip.country eq "AU")`
- **Action**: Redirect (301)
- **Target URL**: `https://feasly.com.au`

### Implementation Instructions

1. **Cloudflare Dashboard Configuration**:
   - Navigate to: Cloudflare Dashboard → Rules → Redirect Rules
   - Create new rule with the following settings:
   
   ```
   Field: Country
   Operator: equals
   Value: AU (Australia)
   
   Action: Dynamic redirect
   Expression: concat("https://feasly.com.au", http.request.uri.path)
   Status code: 301 (Permanent Redirect)
   ```

2. **Alternative Expression (if preferred)**:
   ```
   (ip.geoip.country eq "AU")
   ```

3. **Rule Priority**: Set to highest priority (1) to ensure it executes before other rules

### Legal Compliance Notes

- This rule ensures Australian visitors are redirected to a dedicated stub page
- Prevents service delivery to Australian residents as per legal requirements
- Maintains clear territorial boundaries for regulatory compliance
- Stub page at feasly.com.au should contain clear messaging about service availability

### Testing

To test the rule:
- Use a VPN service with Australian IP addresses
- Verify redirect occurs automatically
- Confirm stub page displays appropriate messaging

### Audit Trail

- **Created**: {Date of implementation}
- **Purpose**: Legal compliance and territorial restrictions
- **Review Date**: {Quarterly review recommended}