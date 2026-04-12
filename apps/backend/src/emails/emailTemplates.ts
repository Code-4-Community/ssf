export type EmailTemplate = {
  subject: string;
  bodyHTML: string;
  additionalContent?: string;
};

export const EMAIL_REDIRECT_URL = 'localhost:4200';
// TODO: Change this before production to be the actual ssf email
export const SSF_PARTNER_EMAIL = 'example@gmail.com';

export const emailTemplates = {
  pantryFmApplicationApproved: (params: { name: string }): EmailTemplate => ({
    subject: 'Your Securing Safe Food Account Has Been Approved',
    bodyHTML: `
      <p>Hi ${params.name},</p>
      <p>
        We're excited to let you know that your Securing Safe Food account has been
        approved and is now active. You can now log in using the credentials created
        during registration to begin submitting requests, managing donations, and
        coordinating with our network.
      </p>
      <p>
        If you have any questions as you get started or need help navigating the
        platform, please do not hesitate to reach out — we are happy to help!
      </p>
      <p>
        We are grateful to have you as part of the SSF community and look forward
        to working together to expand access to allergen-safe food.
      </p>
      <p>Best regards,<br />The Securing Safe Food Team</p>
    `,
  }),

  volunteerAccountCreated: (): EmailTemplate => ({
    subject: 'Welcome to Securing Safe Food: Your Volunteer Account Is Ready',
    bodyHTML: `
      <p>Welcome to Securing Safe Food!</p>
      <p>
        Your volunteer account has been successfully created and you can now log in
        to begin supporting pantry coordination, order matching, and delivery logistics.
      </p>
      <p>
        Once logged in, you'll be able to view your assignments, track active requests,
        and collaborate with partner organizations.
      </p>
      <p>
        Thank you for being part of our mission. Your time and effort directly help
        increase access to safe food for individuals with dietary restrictions.
      </p>
      <p>Best regards,<br />The Securing Safe Food Team</p>
      <p>
        To log in to your account, please click the following link: <a href="${EMAIL_REDIRECT_URL}/login">${EMAIL_REDIRECT_URL}/login</a>
      </p>
    `,
  }),

  pantryFmApplicationSubmittedToAdmin: (): EmailTemplate => ({
    subject: 'New Partner Application Submitted',
    bodyHTML: `
      <p>Hi,</p>
      <p>
        A new partner application has been submitted through the SSF platform. 
        Please log in to the dashboard to review and take action. 
      </p>
      <p>Best regards,<br />The Securing Safe Food Team</p>
      <p>
        To review this application, please enter the admin pantry approval dashboard: <a href="${EMAIL_REDIRECT_URL}/approve-pantries">${EMAIL_REDIRECT_URL}/approve-pantries</a>
      </p>
    `,
  }),

  pantryFmApplicationSubmittedToUser: (params: {
    name: string;
  }): EmailTemplate => ({
    subject: 'Your Application Has Been Submitted',
    bodyHTML: `
      <p>Hi ${params.name},</p>
      <p>
        Thank you for your interest in partnering with Securing Safe Food! 
        Your application has been successfully submitted and is currently under review. We will notify you via email once a decision has been made.
      </p>
      <p>Best regards,<br />The Securing Safe Food Team</p>
    `,
  }),

  pantrySubmitsFoodRequest: (params: {
    pantryName: string;
  }): EmailTemplate => ({
    subject: `${params.pantryName} Request Requires Your Review`,
    bodyHTML: `
      <p>Hi,</p>
      <p>
        A new food request has been submitted by ${params.pantryName}. 
        Please log on to the SSF platform to review these request details and begin coordination when ready.
      </p>
      <p>
        Thank you for your continued support of our network and mission!
      <p>Best regards,<br />The Securing Safe Food Team</p>
    `,
  }),

  fmRecurringDonationReminder: (params: { fmName: string }): EmailTemplate => ({
    subject: 'Reminder: Submit Your Scheduled Recurring Donation with SSF',
    bodyHTML: `
      <p>Hi ${params.fmName},</p>
      <p>
        This is a friendly reminder from Securing Safe Food that your recurring donation
        schedule indicates a new donation submission is due.
      </p>
      <p>
        When you have a moment, please log into your account and submit your current
        donation availability so we can continue matching your contributions with pantry requests.
      </p>
      <p>
        We greatly appreciate your continued generosity and support of our mission. Your
        recurring donations make a meaningful and consistent impact for the communities we serve.
      </p>
      <p>Best regards,<br />The Securing Safe Food Team</p>
    `,
  }),

  trackingLinkAvailable: (params: {
    pantryName: string;
    fmName: string;
    trackingLink: string;
    volunteerName: string;
    volunteerEmail: string;
  }): EmailTemplate => ({
    subject: `Tracking Information for your ${params.fmName} delivery (Securing Safe Food)`,
    bodyHTML: `
      <p>Hi ${params.pantryName},</p>
      <p>
        Good news! Tracking information is now available for your upcoming SSF delivery
        from ${params.fmName}. You can use this tracking information to monitor the
        status of your shipment or log into your portal for more information on your
        expected donation.
      </p>
      <p>
        Tracking Link: <a href="${params.trackingLink}">${params.trackingLink}</a>
      </p>
      <p>
        You can use the tracking link above to monitor your shipment, or <a href="${EMAIL_REDIRECT_URL}/login">log into your portal</a> for full order details and updates.
      </p>
      <p>
        If you experience any issues or have questions, please contact your coordinator,
        ${params.volunteerName}, at <a href="mailto:${params.volunteerEmail}">${params.volunteerEmail}</a>, and our team will be happy to assist.
      </p>
      <p>Best regards,<br />The Securing Safe Food Team</p>
    `,
  }),

  pantryConfirmsOrderDelivery: (params: {
    volunteerName: string;
    pantryName: string;
    fmName: string;
  }): EmailTemplate => ({
    subject: `${params.pantryName} Confirmed for your ${params.fmName} Order`,
    bodyHTML: `
      <p>Hi ${params.volunteerName},</p>
      <p>
        ${params.pantryName} has confirmed receipt of the most recent ${params.fmName}
        order you are assigned to. Please log into the platform to review the completed
        request or check for additional information.
      </p>
      <p>
        Thank you for your coordination and support in helping reach this order to completion!
      </p>
      <p>Best regards,<br />The Securing Safe Food Team</p>
    `,
  }),
};
