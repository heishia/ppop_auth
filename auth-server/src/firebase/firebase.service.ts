import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app: admin.app.App | null = null;
  private isConfigured = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (projectId && clientEmail && privateKey) {
      try {
        this.app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
        this.isConfigured = true;
      } catch (error) {
        console.error('Firebase initialization error:', error);
      }
    } else {
      console.log('[Firebase] Not configured - phone verification will use mock mode');
    }
  }

  async verifyPhoneToken(idToken: string): Promise<{ phoneNumber: string; uid: string }> {
    if (!this.isConfigured || !this.app) {
      console.log('[Firebase MOCK] Verifying phone token');
      return {
        phoneNumber: '+821012345678',
        uid: 'mock-firebase-uid',
      };
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      if (!decodedToken.phone_number) {
        throw new BadRequestException('Token does not contain phone number');
      }

      return {
        phoneNumber: decodedToken.phone_number,
        uid: decodedToken.uid,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Firebase token verification error:', error);
      throw new BadRequestException('Invalid Firebase token');
    }
  }

  isEnabled(): boolean {
    return this.isConfigured;
  }
}

