export interface Team {
  id: string;
  name: string;
  range: [number, number];
}

export const TEAMS: Team[] = [
  { id: 'FWC', name: 'FIFA', range: [0, 19] },
  { id: 'CC', name: 'Coca Cola', range: [1, 14] },
  { id: 'MEX', name: 'México', range: [1, 20] },
  { id: 'RSA', name: 'Sudáfrica', range: [1, 20] },
  { id: 'KOR', name: 'Corea', range: [1, 20] },
  { id: 'CZE', name: 'R. Checa', range: [1, 20] },
  { id: 'CAN', name: 'Canadá', range: [1, 20] },
  { id: 'BIH', name: 'Bosnia', range: [1, 20] },
  { id: 'QAT', name: 'Qatar', range: [1, 20] },
  { id: 'SUI', name: 'Suiza', range: [1, 20] },
  { id: 'BRA', name: 'Brasil', range: [1, 20] },
  { id: 'MAR', name: 'Marruecos', range: [1, 20] },
  { id: 'HAI', name: 'Haití', range: [1, 20] },
  { id: 'SCO', name: 'Escocia', range: [1, 20] },
  { id: 'USA', name: 'EE.UU.', range: [1, 20] },
  { id: 'PAR', name: 'Paraguay', range: [1, 20] },
  { id: 'AUS', name: 'Australia', range: [1, 20] },
  { id: 'TUR', name: 'Turquía', range: [1, 20] },
  { id: 'GER', name: 'Alemania', range: [1, 20] },
  { id: 'CUW', name: 'Curazao', range: [1, 20] },
  { id: 'CIV', name: 'C. Marfil', range: [1, 20] },
  { id: 'ECU', name: 'Ecuador', range: [1, 20] },
  { id: 'NED', name: 'Países Bajos', range: [1, 20] },
  { id: 'JPN', name: 'Japón', range: [1, 20] },
  { id: 'SWE', name: 'Suecia', range: [1, 20] },
  { id: 'TUN', name: 'Túnez', range: [1, 20] },
  { id: 'BEL', name: 'Bélgica', range: [1, 20] },
  { id: 'EGY', name: 'Egipto', range: [1, 20] },
  { id: 'IRN', name: 'Irán', range: [1, 20] },
  { id: 'NZL', name: 'Nueva Zelanda', range: [1, 20] },
  { id: 'ESP', name: 'España', range: [1, 20] },
  { id: 'CPV', name: 'Cabo Verde', range: [1, 20] },
  { id: 'KSA', name: 'Arabia S.', range: [1, 20] },
  { id: 'URU', name: 'Uruguay', range: [1, 20] },
  { id: 'FRA', name: 'Francia', range: [1, 20] },
  { id: 'SEN', name: 'Senegal', range: [1, 20] },
  { id: 'IRQ', name: 'Irak', range: [1, 20] },
  { id: 'NOR', name: 'Noruega', range: [1, 20] },
  { id: 'ARG', name: 'Argentina', range: [1, 20] },
  { id: 'ALG', name: 'Argelia', range: [1, 20] },
  { id: 'AUT', name: 'Austria', range: [1, 20] },
  { id: 'JOR', name: 'Jordania', range: [1, 20] },
  { id: 'POR', name: 'Portugal', range: [1, 20] },
  { id: 'COD', name: 'RD Congo', range: [1, 20] },
  { id: 'UZB', name: 'Uzbekistán', range: [1, 20] },
  { id: 'COL', name: 'Colombia', range: [1, 20] },
  { id: 'ENG', name: 'Inglaterra', range: [1, 20] },
  { id: 'CRO', name: 'Croacia', range: [1, 20] },
  { id: 'GHA', name: 'Ghana', range: [1, 20] },
  { id: 'PAN', name: 'Panamá', range: [1, 20] }
];

export const TOTAL_STICKERS = TEAMS.reduce((acc, team) => acc + (team.range[1] - team.range[0] + 1), 0);

export function getAllStickerIds(): string[] {
  const ids: string[] = [];
  TEAMS.forEach(team => {
    for (let i = team.range[0]; i <= team.range[1]; i++) {
        ids.push(`${team.id} ${i}`);
    }
  });
  return ids;
}

export function parseStickerCode(input: string): string | null {
  const normalized = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const match = normalized.match(/^([A-Z]{3})(\d+)/); // Support more digits if needed
  if (match) {
    const teamId = match[1];
    const number = parseInt(match[2], 10);
    const team = TEAMS.find(t => t.id === teamId);
    if (team && number >= team.range[0] && number <= team.range[1]) {
      return `${teamId} ${number}`;
    }
  }
  return null;
}
