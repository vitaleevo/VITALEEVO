export const isAdmin = (email?: string | null) => {
    if (!email) return false;

    const normalizedEmail = email.trim().toLowerCase();

    const adminEmails = [
        "negociosvitaleevo@gmail.com",
        "alexandre.pinto@vitaleevo.ao",
        "info@vitaleevo.ao",
        "admin@vitaleevo.ao"
    ];

    const envAdminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (envAdminEmail) {
        const envEmails = envAdminEmail.split(',').map(e => e.trim().toLowerCase());
        adminEmails.push(...envEmails);
    }

    const isAuthorized = adminEmails.some(adminEmail =>
        adminEmail.trim().toLowerCase() === normalizedEmail
    );

    if (!isAuthorized) {
        console.warn(`[Admin Check] Unauthorized attempt: ${normalizedEmail}`);
    } else {
        console.log(`[Admin Check] Authorized: ${normalizedEmail}`);
    }

    return isAuthorized;
};
