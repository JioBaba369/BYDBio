
'use server';

import { z } from 'zod';
import { createNotification } from '@/lib/notifications';

const ContactFormSchema = z.object({
  recipientId: z.string(),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }).max(1000, { message: 'Message must be less than 1000 characters.' }),
});

export type ContactFormState = {
  message: string;
  success?: boolean;
  errors?: {
    name?: string[];
    email?: string[];
    message?: string[];
    recipientId?: string[];
  };
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = ContactFormSchema.safeParse({
    recipientId: formData.get('recipientId'),
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to send message. Please check the fields.',
      success: false,
    };
  }
  
  const { recipientId, name, email, message } = validatedFields.data;

  try {
    await createNotification(recipientId, 'contact_form_submission', null, {
        senderName: name,
        senderEmail: email,
        messageBody: message,
    });

    return { message: 'Your message has been sent successfully!', success: true };
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return { message: 'An unexpected error occurred. Please try again later.', success: false };
  }
}
