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

  pantryRequestMatchedOrder: (params: {
    pantryName: string;
    items: { quantity: string; product: string }[];
    brand: string;
    volunteerName: string;
    volunteerEmail: string;
  }): EmailTemplate => ({
    subject: 'Your Securing Safe Food Request Has Been Matched to a Delivery',
    bodyHTML: `
      <p>Hi ${params.pantryName},</p>
      <p>
        Good news! Your recent food request through Securing Safe Food has been successfully matched to an order and is now moving forward toward delivery. 
      </p>
      <p>
      <strong>Items you will receive from ${params.brand}:</strong>
      <ul>
        ${params.items
          .map((item) => `<li>${item.quantity} of ${item.product}</li>`)
          .join('')}
      </ul>
    </p>
      <p>
        To view full order details, delivery updates, and any notes from the coordinating volunteer or food manufacturer, please log into the platform. 
      </p>
      <p>
        If any details change on your end or you have updated availability, please update your request in the system or email your coordinator, ${
          params.volunteerName
        } at ${params.volunteerEmail}.
      </p>
      <p>
        We will continue to keep you informed as the order progresses. We’re excited to help support your pantry and looking forward to this donation!
      </p>
      <p>Best regards,<br />The Securing Safe Food Team</p>
      <p>
        To log in to your account, please click the following link: <a href="${EMAIL_REDIRECT_URL}/login">${EMAIL_REDIRECT_URL}/login</a>
      </p>
    `,
  }),

  fmDonationMatchedOrder: (params: {
    manufacturerName: string;
    items: { quantity: string; product: string }[];
    pantryName: string;
    pantryAddress: string;
    volunteerName: string;
    volunteerEmail: string;
  }): EmailTemplate => ({
    subject:
      'Your Securing Safe Food Donation Has Been Matched to a Pantry Order',
    bodyHTML: `
    <p>Hi ${params.manufacturerName},</p>
    <p>
      Thank you for your continued partnership with Securing Safe Food. A donation you submitted has now been successfully matched to a pantry request and is moving forward towards fulfillment.
    </p>
    <p>
      <strong>Matched Items:</strong><br />
      ${params.items
        .map((item) => `• ${item.quantity} of ${item.product}`)
        .join('<br />')}
      <br /><br />
      <strong>Recipient Pantry:</strong> ${params.pantryName}<br />
      <strong>Address:</strong><br />
      ${params.pantryAddress}
    </p>
    <p>
      Please log into the platform to review the full delivery details, timelines, and any special handling instructions associated with this shipment.
    </p>
    <p>
      Your support plays a direct role in expanding access to allergen-safe foods, and we truly appreciate your commitment to this work.
    </p>
    <p>
      If you have any questions or need assistance, please contact your coordinator, ${
        params.volunteerName
      } at ${params.volunteerEmail}.
    </p>
    <p>
      Thank you so much.
    </p>
    <p>Best regards,<br />The Securing Safe Food Team</p>
    <p>
        To log in to your account, please click the following link: <a href="${EMAIL_REDIRECT_URL}/login">${EMAIL_REDIRECT_URL}/login</a>
      </p>
  `,
  }),

  trackingLinkAvailable: (params: {
    pantryName: string;
    manufacturerName: string;
    trackingLink: string;
    volunteerName: string;
    volunteerEmail: string;
  }): EmailTemplate => ({
    subject: `Tracking Information for your ${params.manufacturerName} delivery (Securing Safe Food)`,
    bodyHTML: `
    <p>Hi ${params.pantryName},</p>
    <p>
      Good news! Tracking information is now available for your upcoming SSF delivery from ${params.manufacturerName}. You can use this tracking information to monitor the status of your shipment or log into your portal for more information on your expected donation.
    </p>
    <p>
      <strong>Tracking Link:</strong><br />
      <a href="${params.trackingLink}">${params.trackingLink}</a>
    </p>
    <p>
      You can use the tracking link above to monitor your shipment, or log into your portal for full order details and updates.
    </p>
    <p>
      If you experience any issues or have questions, please contact your coordinator, ${params.volunteerName}, at ${params.volunteerEmail}, and our team will be happy to assist.
    </p>
    <p>Best regards,<br />The Securing Safe Food Team</p>
  `,
  }),
};
