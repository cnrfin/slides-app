// src/api/auth/google-one-tap.example.ts
// This is an example of how to implement the backend handler for Google One Tap
// This should be implemented in your backend service (Node.js, Deno, etc.)
// For production, this should NOT be in the frontend code

import { OAuth2Client } from 'google-auth-library'
import { createClient } from '@supabase/supabase-js'

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
)

// Initialize Supabase Admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for admin operations
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface GoogleOneTapRequest {
  token: string
  provider: 'google-one-tap'
}

/**
 * Backend handler for Google One Tap authentication
 * This should be exposed as an API endpoint (e.g., POST /api/auth/google-one-tap)
 */
export async function handleGoogleOneTap(request: GoogleOneTapRequest) {
  try {
    // 1. Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: request.token,
      audience: process.env.GOOGLE_CLIENT_ID
    })
    
    const payload = ticket.getPayload()
    if (!payload) {
      throw new Error('Invalid token payload')
    }
    
    const { email, email_verified, name, picture, sub: googleId } = payload
    
    if (!email_verified) {
      throw new Error('Email not verified')
    }
    
    // 2. Check if user exists in Supabase
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()
    
    let userId: string
    
    if (existingUser) {
      // User exists, get their ID
      userId = existingUser.id
      
      // Update their profile with latest Google info
      await supabaseAdmin
        .from('profiles')
        .update({
          display_name: name,
          avatar_url: picture,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          avatar_url: picture,
          provider: 'google',
          google_id: googleId
        }
      })
      
      if (createError || !newUser.user) {
        throw new Error('Failed to create user')
      }
      
      userId = newUser.user.id
      
      // Create profile
      await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email,
          display_name: name,
          avatar_url: picture
        })
    }
    
    // 3. Generate Supabase session for the user
    const { data: session, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.FRONTEND_URL}/dashboard`
      }
    })
    
    if (sessionError || !session) {
      throw new Error('Failed to create session')
    }
    
    // Alternative: Create a custom JWT session
    // This requires configuring custom JWT secret in Supabase
    const { data: { session: customSession }, error } = await supabaseAdmin.auth.admin.createSession({
      user_id: userId
    })
    
    if (error || !customSession) {
      throw new Error('Failed to create custom session')
    }
    
    // 4. Return session and user data
    return {
      success: true,
      session: {
        access_token: customSession.access_token,
        refresh_token: customSession.refresh_token,
        expires_at: customSession.expires_at
      },
      user: {
        id: userId,
        email,
        user_metadata: {
          full_name: name,
          avatar_url: picture
        }
      }
    }
  } catch (error) {
    console.error('Google One Tap verification failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    }
  }
}

/**
 * Express.js example endpoint
 */
export function setupGoogleOneTapEndpoint(app: any) {
  app.post('/api/auth/google-one-tap', async (req: any, res: any) => {
    const result = await handleGoogleOneTap(req.body)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(401).json({ error: result.error })
    }
  })
}

/**
 * Next.js API Route example
 */
export async function POST(request: Request) {
  const body = await request.json()
  const result = await handleGoogleOneTap(body)
  
  if (result.success) {
    return Response.json(result)
  } else {
    return Response.json({ error: result.error }, { status: 401 })
  }
}
