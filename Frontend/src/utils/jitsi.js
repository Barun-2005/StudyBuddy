import encode from 'jwt-encode';

export const generateJitsiJWT = (roomId, userInfo) => {
  // Get the full string from env
  const fullString = import.meta.env.VITE_JITSI_APP_ID; // "vpaas-magic-cookie-c2a8296ccab645118b3a28a65cfc7974/508f80"
  
  // Extract the app ID (everything before the last slash)
  const appId = fullString.substring(0, fullString.lastIndexOf('/'));
  
  // Extract the API key (everything after the last slash)
  const apiKey = fullString.substring(fullString.lastIndexOf('/') + 1);

  const payload = {
    aud: 'jitsi',
    iss: appId,
    sub: appId,
    room: '*',  // Allow access to all rooms
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    nbf: Math.floor(Date.now() / 1000) - 10, // Valid from 10 seconds ago
    kid: apiKey, // Required by 8x8.vc
    context: {
      user: {
        name: userInfo.fullName,
        email: userInfo.email,
        id: userInfo._id,
        avatar: userInfo.profilePic || '',
        moderator: true
      },
      features: {
        livestreaming: true,
        recording: true,
        transcription: true,
        "outbound-call": true
      }
    }
  };

  return encode(payload, apiKey);
};




