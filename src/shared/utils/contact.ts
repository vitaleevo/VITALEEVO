export const PHONE_CONTACTS = [
    {
        label: "Linha comercial",
        display: "+244 950 744 445",
        digits: "244950744445",
    },
    {
        label: "Atendimento",
        display: "+244 924 197 009",
        digits: "244924197009",
    },
] as const;

export const SITE_CONTACT = {
    email: "info@vitaleevo.ao",
    primaryPhone: PHONE_CONTACTS[0].display,
    whatsapp: PHONE_CONTACTS[0].digits,
    address: "Benfica, Luanda, Angola",
    mapUrl: "https://maps.app.goo.gl/ibdkcuwHPBSARizE9",
} as const;
