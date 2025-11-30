export enum Rashi {
	MESH = "Mesh (Aries)",
	VRISHABH = "Vrishabh (Taurus)",
	MITHUN = "Mithun (Gemini)",
	KARK = "Kark (Cancer)",
	SINGH = "Singh (Leo)",
	KANYA = "Kanya (Virgo)",
	TULA = "Tula (Libra)",
	VRISHCHIK = "Vrishchik (Scorpio)",
	DHANU = "Dhanu (Sagittarius)",
	MAKAR = "Makar (Capricorn)",
	KUMBH = "Kumbh (Aquarius)",
	MEEN = "Meen (Pisces)",
}

export enum Nakshatra {
	ASHWINI = "Ashwini",
	BHARANI = "Bharani",
	KRITTIKA = "Krittika",
	ROHINI = "Rohini",
	MRIGASHIRA = "Mrigashira",
	ARDRA = "Ardra",
	PUNARVASU = "Punarvasu",
	PUSHYA = "Pushya",
	ASHLESHA = "Ashlesha",
	MAGHA = "Magha",
	PURVA_PHALGUNI = "Purva Phalguni",
	UTTARA_PHALGUNI = "Uttara Phalguni",
	HASTA = "Hasta",
	CHITRA = "Chitra",
	SWATI = "Swati",
	VISHAKHA = "Vishakha",
	ANURADHA = "Anuradha",
	JYESHTHA = "Jyeshtha",
	MOOLA = "Moola",
	PURVA_ASHADHA = "Purva Ashadha",
	UTTARA_ASHADHA = "Uttara Ashadha",
	SHRAVANA = "Shravana",
	DHANISHTA = "Dhanishta",
	SHATABHISHA = "Shatabhisha",
	PURVA_BHADRAPADA = "Purva Bhadrapada",
	UTTARA_BHADRAPADA = "Uttara Bhadrapada",
	REVATI = "Revati",
}

export interface Profile {
	id: string;
	name: string;
	relation: string;
	dob: string;
	nakshatra: string;
	rashi: string;
	contactNumber: string;
	occupation: string;
	address: string;
}

