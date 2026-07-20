function isUserNotFound(error) {
  return error?.code === "auth/user-not-found";
}

async function findUser(lookup) {
  try {
    return await lookup();
  } catch (error) {
    if (isUserNotFound(error)) {
      return null;
    }
    throw error;
  }
}

export async function upsertAuthUser(adminAuth, account, email, password) {
  const existingUser = await findUser(() => adminAuth.getUser(account.uid));
  const emailOwner = await findUser(() => adminAuth.getUserByEmail(email));

  if (emailOwner && emailOwner.uid !== account.uid) {
    throw new Error(`${email} is already assigned to another Firebase user.`);
  }

  const userProperties = {
    email,
    password,
    displayName: account.displayName,
    emailVerified: true,
    disabled: false,
  };

  if (existingUser || emailOwner) {
    return adminAuth.updateUser(account.uid, userProperties);
  }

  return adminAuth.createUser({
    uid: account.uid,
    ...userProperties,
  });
}
