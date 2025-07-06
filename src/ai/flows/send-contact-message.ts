'use server';
/**
 * @fileOverview A server action to handle sending contact messages from a user's profile.
 * - sendContactMessage - A function that creates a notification for the profile owner.
 * - SendContactMessageInput - The input type for the sendContactMessage function.
 */

import { z } from 'genkit';
import { createNotification } from '@/lib/notifications';
import { getUserByUsername } from '@/lib/users';

const SendContactMessageInputSchema = z.object({
  recipientUsername: z.string().describe("The username of the person receiving the message."),
  senderName: z.string().min(2, "Name must be at least 2 characters.").describe("The name of the person sending the message."),
  senderEmail: z.string().email().describe("The email of the person sending the message."),
  message: z.string().min(10, "Message must be at least 10 characters.").describe("The message content."),
});
export type SendContactMessageInput = z.infer<typeof SendContactMessageInputSchema>;

// This is a simple server action, not a Genkit flow with prompts.
export async function sendContactMessage(input: SendContactMessageInput): Promise<{ success: boolean }> {
    const { recipientUsername, senderName, senderEmail, message } = input;

    const recipient = await getUserByUsername(recipientUsername);
    if (!recipient) {
        throw new Error('Recipient not found.');
    }

    // Since the sender can be a guest, there is no `actorId`.
    // The sender's info is passed directly into the notification.
    await createNotification(recipient.uid, 'contact_form_submission', undefined, {
        senderName,
        senderEmail,
        messageBody: message,
    });
    
    return { success: true };
}
