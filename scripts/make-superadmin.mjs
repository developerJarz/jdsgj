import nextEnv from '@next/env';
import mongoose from 'mongoose';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function makeSuperadmin(rawIdentifier, { uri, client = mongoose, output = console } = {}) {
  const identifier = rawIdentifier?.trim();
  if (!identifier) {
    output.error('Usage: npm run superadmin -- "your-existing-email-or-phone"\nReplace the example with the exact email or phone you use to sign in.');
    return 1;
  }
  if (!uri) {
    output.error('MONGODB_URI is missing. Configure it in the project\'s .env.local file.');
    return 1;
  }
  try {
    await client.connect(uri, { serverSelectionTimeoutMS: 5000 });
    const users = client.connection.collection('users');
    const account = await users.findOne({ $or: [{ phone: identifier }, { email: identifier.toLowerCase() }] });
    if (!account) throw new Error(`Account not found for "${identifier}". Use the exact email or phone you use to sign in, or create an account at /login first.`);
    if (account.isActive === false) throw new Error('This account is suspended. Activate it before granting super admin access.');
    const result = await users.updateOne({ _id: account._id }, { $set: { role: 'superadmin', updatedAt: new Date() } });
    if (result.matchedCount !== 1) throw new Error('The account no longer exists. No access was granted.');
    output.log(`Super admin access granted to ${account.name}. Sign in and open /super-admin.`);
    return 0;
  } catch (error) {
    const reason = (error instanceof Error ? error.message : String(error))
      .replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, '[MongoDB connection string hidden]');
    output.error(`Could not grant access: ${reason}`);
    return 1;
  } finally {
    await client.disconnect();
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  nextEnv.loadEnvConfig(projectRoot);
  process.exitCode = await makeSuperadmin(process.argv[2], { uri: process.env.MONGODB_URI });
}
