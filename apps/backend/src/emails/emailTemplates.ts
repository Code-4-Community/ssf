export type EmailTemplate = {
  subject: string;
  bodyHTML: string;
  additionalContent?: string;
};

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
    `,
    additionalContent: 'localhost:4200/',
  }),

  pantryFmApplicationSubmitted: (): EmailTemplate => ({
    subject: 'New Partner Application Submitted',
    bodyHTML: `
      <p>Hi,</p>
      <p>
        A new partner application has been submitted through the SSF platform. 
        Please log in to the dashboard to review and take action. 
      </p>
      <p>Best regards,<br />The Securing Safe Food Team</p>
    `,
    additionalContent: 'localhost:4200/',
  }),

  pantrySubmitsFoodRequest: (params: {
    pantryName: string;
    volunteerName: string;
  }): EmailTemplate => ({
    subject: `${params.pantryName} Request Requires Your Review`,
    bodyHTML: `
      <p>Hi ${params.volunteerName},</p>
      <p>
        A new food request has been submitted by ${params.pantryName}. 
        Please log on to the SSF platform to review these request details and begin coordination when ready.
      </p>
      <p>
        Thank you for your continued support of our network and mission!.
      <p>Best regards,<br />The Securing Safe Food Team</p>
    `,
  }),
};
