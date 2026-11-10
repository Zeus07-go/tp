// The NYXOS Lunar Archive: an original, hand-written record of lunar missions.
// All text is written for NYXOS. Mission facts are historical record; coordinates marked `approx`
// are rounded or schematic and are drawn that way on the globe.

export type AgencyId = 'us' | 'ussr' | 'china' | 'india' | 'japan' | 'europe' | 'private'
export type MissionType = 'crewed' | 'lander' | 'rover' | 'orbiter' | 'sample' | 'impactor' | 'flyby' | 'deep'
export type Outcome = 'success' | 'partial' | 'lost' | 'planned'

export interface Agency {
  id: AgencyId
  label: string
  short: string
  color: string
}

export interface Site {
  name: string
  lat: number
  lon: number
  approx?: boolean
}

export interface Mission {
  id: string
  name: string
  agency: AgencyId
  date: string
  dateNote?: string
  types: MissionType[]
  outcome: Outcome
  site?: Site
  crew?: string[]
  summary: string
  facts: string[]
  /** Fractional year of `date`, used by the timeline. */
  t: number
}

export const AGENCIES: Agency[] = [
  { id: 'us', label: 'United States', short: 'US', color: '#7cc4ff' },
  { id: 'ussr', label: 'USSR / Russia', short: 'USSR', color: '#ff9a6b' },
  { id: 'china', label: 'China', short: 'China', color: '#ff6f91' },
  { id: 'india', label: 'India', short: 'India', color: '#ffd166' },
  { id: 'japan', label: 'Japan', short: 'Japan', color: '#b69cff' },
  { id: 'europe', label: 'Europe (ESA)', short: 'ESA', color: '#6fe3b4' },
  { id: 'private', label: 'Commercial & private', short: 'Private', color: '#ece4d2' },
]

export const AGENCY_BY_ID = new Map(AGENCIES.map((a) => [a.id, a]))

export const TYPE_LABELS: Record<MissionType, string> = {
  crewed: 'Crewed',
  lander: 'Lander',
  rover: 'Rover',
  orbiter: 'Orbiter',
  sample: 'Sample return',
  impactor: 'Impactor',
  flyby: 'Flyby',
  deep: 'Deep space',
}

export const TYPE_ORDER: MissionType[] = ['crewed', 'lander', 'rover', 'orbiter', 'sample', 'impactor', 'flyby', 'deep']

export const OUTCOME_LABELS: Record<Outcome, string> = {
  success: 'Success',
  partial: 'Partial',
  lost: 'Lost',
  planned: 'Planned',
}

export const OUTCOME_ORDER: Outcome[] = ['success', 'partial', 'lost', 'planned']

export const MIN_T = 1959
export const MAX_T = 2029

export interface Era {
  id: string
  label: string
  from: number
  to: number
  blurb: string
}

export const ERAS: Era[] = [
  { id: 'race', label: 'Space Race', from: 1959, to: 1977, blurb: 'Two superpowers race to be first: probes, landers and twelve moonwalkers.' },
  { id: 'pause', label: 'Long Pause', from: 1977, to: 1994, blurb: 'Attention moves elsewhere and lunar missions all but stop.' },
  { id: 'revival', label: 'Robotic Revival', from: 1994, to: 2019, blurb: 'Orbiters map the Moon and find signs of water at the poles.' },
  { id: 'new', label: 'New Lunar Age', from: 2019, to: 2029, blurb: 'Landings multiply, companies join in, and crews return to deep space.' },
]

type Raw = Omit<Mission, 't'>

const RAW: Raw[] = [
  { id: 'luna-1', name: 'Luna 1', agency: 'ussr', date: '1959-01-04', types: ['flyby'], outcome: 'success',
    summary: 'The first spacecraft to fly past the Moon, passing roughly 6,000 km from its surface before heading into orbit around the Sun.',
    facts: ['Launched 2 January 1959', 'Missed its planned impact, and became the first artificial object in solar orbit'] },
  { id: 'luna-2', name: 'Luna 2', agency: 'ussr', date: '1959-09-13', types: ['impactor'], outcome: 'success',
    site: { name: 'Near Autolycus, Mare Imbrium', lat: 29.1, lon: 0, approx: true },
    summary: 'The first human-made object to reach another world, striking the Moon at high speed in the Mare Imbrium region.',
    facts: ['A deliberate hard impact: it carried no landing system', 'Found no measurable lunar magnetic field'] },
  { id: 'luna-3', name: 'Luna 3', agency: 'ussr', date: '1959-10-07', types: ['flyby'], outcome: 'success',
    summary: 'Photographed the side of the Moon that never faces Earth, returning the first, faint images of the far side.',
    facts: ['Launched 4 October 1959; images taken on 7 October', 'Produced the first rough atlas of the far side, including Tsiolkovskiy crater'] },
  { id: 'ranger-7', name: 'Ranger 7', agency: 'us', date: '1964-07-31', types: ['impactor'], outcome: 'success',
    site: { name: 'Mare Cognitum', lat: -10.6, lon: -20.6 },
    summary: 'After a run of failures, Ranger 7 sent back thousands of close-up images in its last minutes before impact.',
    facts: ['4,316 photographs transmitted before impact', 'Helped show that mare surfaces could be landed on'] },
  { id: 'luna-9', name: 'Luna 9', agency: 'ussr', date: '1966-02-03', types: ['lander'], outcome: 'success',
    site: { name: 'Oceanus Procellarum', lat: 7.08, lon: -64.37 },
    summary: 'The first controlled soft landing on the Moon. It opened up and sent back panoramas from the surface.',
    facts: ['Landed 3 February 1966', 'Showed that the surface could bear the weight of a lander'] },
  { id: 'surveyor-1', name: 'Surveyor 1', agency: 'us', date: '1966-06-02', types: ['lander'], outcome: 'success',
    site: { name: 'Oceanus Procellarum', lat: -2.47, lon: -43.34 },
    summary: "America's first soft landing, a flawless debut that proved the Moon could be landed on.",
    facts: ['More than 11,000 images returned', 'Part of the programme that scouted Apollo landing sites'] },
  { id: 'lunar-orbiter-1', name: 'Lunar Orbiter 1', agency: 'us', date: '1966-08-14', types: ['orbiter'], outcome: 'success',
    summary: 'First of five US orbiters that photographed candidate Apollo sites and, almost incidentally, nearly the whole Moon.',
    facts: ['Captured the first view of Earth rising over the lunar limb, 23 August 1966', 'The five missions together imaged almost the entire surface'] },
  { id: 'zond-5', name: 'Zond 5', agency: 'ussr', date: '1968-09-18', types: ['flyby'], outcome: 'success',
    summary: 'The first spacecraft to circle the Moon and return to Earth, carrying tortoises, insects and plants.',
    facts: ['Flew past the far side on 18 September 1968', 'Splashed down in the Indian Ocean on 21 September'] },
  { id: 'apollo-8', name: 'Apollo 8', agency: 'us', date: '1968-12-24', types: ['crewed', 'orbiter'], outcome: 'success',
    crew: ['Frank Borman', 'Jim Lovell', 'Bill Anders'],
    summary: 'The first humans to leave Earth orbit and circle the Moon, ten times over Christmas 1968.',
    facts: ['Launched 21 December 1968, back on 27 December', "Bill Anders took the 'Earthrise' photograph", 'Read from the Book of Genesis in a Christmas Eve broadcast'] },
  { id: 'apollo-10', name: 'Apollo 10', agency: 'us', date: '1969-05-22', types: ['crewed', 'orbiter'], outcome: 'success',
    crew: ['Tom Stafford', 'John Young', 'Gene Cernan'],
    summary: 'The full dress rehearsal for the landing. The lunar module descended to about 15 km above the surface.',
    facts: ['Launched 18 May 1969', 'Tested every step of a landing except the touchdown'] },
  { id: 'apollo-11', name: 'Apollo 11', agency: 'us', date: '1969-07-20', types: ['crewed', 'lander', 'sample'], outcome: 'success',
    site: { name: 'Tranquility Base, Mare Tranquillitatis', lat: 0.67, lon: 23.47 },
    crew: ['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins'],
    summary: 'Humans first stepped onto another world. Armstrong and Aldrin walked the surface while Collins orbited above.',
    facts: ['Landed 20 July 1969', 'About two and a half hours outside the lunar module', '21.5 kg of lunar samples returned'] },
  { id: 'apollo-12', name: 'Apollo 12', agency: 'us', date: '1969-11-19', types: ['crewed', 'lander', 'sample'], outcome: 'success',
    site: { name: 'Oceanus Procellarum', lat: -3.01, lon: -23.42 },
    crew: ['Pete Conrad', 'Alan Bean', 'Dick Gordon'],
    summary: 'A pinpoint landing within walking distance of Surveyor 3, which the crew visited and sampled.',
    facts: ['Landed 19 November 1969', 'Brought back parts of Surveyor 3 for study on Earth'] },
  { id: 'apollo-13', name: 'Apollo 13', agency: 'us', date: '1970-04-15', types: ['crewed', 'flyby'], outcome: 'partial',
    crew: ['Jim Lovell', 'Jack Swigert', 'Fred Haise'],
    summary: 'An oxygen tank failure ended the landing attempt. The crew used the lunar module as a lifeboat and swung around the Moon to get home.',
    facts: ['Launched 11 April 1970, returned 17 April', 'Its distance from Earth stood as the human record until Artemis II in 2026'] },
  { id: 'luna-16', name: 'Luna 16', agency: 'ussr', date: '1970-09-20', types: ['lander', 'sample'], outcome: 'success',
    site: { name: 'Mare Fecunditatis', lat: -0.68, lon: 56.3 },
    summary: 'The first robotic sample return from another world: a drill collected about 100 g of soil and sent it home.',
    facts: ['Landed 20 September 1970', 'Capsule returned to Earth on 24 September'] },
  { id: 'luna-17', name: 'Luna 17 · Lunokhod 1', agency: 'ussr', date: '1970-11-17', types: ['lander', 'rover'], outcome: 'success',
    site: { name: 'Mare Imbrium', lat: 38.28, lon: -35.0 },
    summary: 'Delivered Lunokhod 1, the first remotely driven rover on another world.',
    facts: ['Roved for about eleven months', 'Covered roughly 10.5 km'] },
  { id: 'apollo-14', name: 'Apollo 14', agency: 'us', date: '1971-02-05', types: ['crewed', 'lander', 'sample'], outcome: 'success',
    site: { name: 'Fra Mauro', lat: -3.65, lon: -17.47 },
    crew: ['Alan Shepard', 'Stuart Roosa', 'Edgar Mitchell'],
    summary: 'The first landing after Apollo 13, flown to the Fra Mauro highlands that were the lost mission\u2019s target.',
    facts: ['Landed 5 February 1971', 'Shepard hit two golf balls on the surface', 'About 43 kg of samples returned'] },
  { id: 'apollo-15', name: 'Apollo 15', agency: 'us', date: '1971-07-30', types: ['crewed', 'lander', 'rover', 'sample'], outcome: 'success',
    site: { name: 'Hadley\u2013Apennine', lat: 26.13, lon: 3.63 },
    crew: ['David Scott', 'Al Worden', 'James Irwin'],
    summary: 'The first extended-stay mission, and the first to bring a Lunar Roving Vehicle.',
    facts: ['Landed 30 July 1971', 'The rover carried the crew kilometres from the lander', 'About 77 kg of samples returned'] },
  { id: 'luna-20', name: 'Luna 20', agency: 'ussr', date: '1972-02-21', types: ['lander', 'sample'], outcome: 'success',
    site: { name: 'Apollonius Highlands', lat: 3.57, lon: 56.55 },
    summary: 'The second Soviet robotic sample return, drilling in rugged highland terrain.',
    facts: ['Landed 21 February 1972', 'Soil capsule returned to Earth days later'] },
  { id: 'apollo-16', name: 'Apollo 16', agency: 'us', date: '1972-04-21', types: ['crewed', 'lander', 'rover', 'sample'], outcome: 'success',
    site: { name: 'Descartes Highlands', lat: -8.97, lon: 15.5 },
    crew: ['John Young', 'Ken Mattingly', 'Charlie Duke'],
    summary: 'The first landing in the lunar highlands.',
    facts: ['Landed 21 April 1972', 'Deployed a far-ultraviolet camera that imaged Earth and distant stars', 'About 95 kg of samples returned'] },
  { id: 'apollo-17', name: 'Apollo 17', agency: 'us', date: '1972-12-11', types: ['crewed', 'lander', 'rover', 'sample'], outcome: 'success',
    site: { name: 'Taurus\u2013Littrow', lat: 20.19, lon: 30.77 },
    crew: ['Gene Cernan', 'Ron Evans', 'Harrison Schmitt'],
    summary: 'The last crewed landing of the Apollo era, and the only one to carry a professional geologist.',
    facts: ['Landed 11 December 1972', 'Three moonwalks totalling about 22 hours', 'About 110 kg of samples, the largest haul', 'No one has walked on the Moon since'] },
  { id: 'luna-21', name: 'Luna 21 · Lunokhod 2', agency: 'ussr', date: '1973-01-15', types: ['lander', 'rover'], outcome: 'success',
    site: { name: 'Le Monnier crater', lat: 25.85, lon: 30.45 },
    summary: 'Landed Lunokhod 2, which drove far beyond its predecessor.',
    facts: ['Landed 15 January 1973', 'Covered about 39 km, a distance not beaten by any rover on another world until 2014'] },
  { id: 'luna-24', name: 'Luna 24', agency: 'ussr', date: '1976-08-18', types: ['lander', 'sample'], outcome: 'success',
    site: { name: 'Mare Crisium', lat: 12.75, lon: 62.2 },
    summary: 'The last Soviet lunar mission. It drilled about two metres into the soil of Mare Crisium.',
    facts: ['Landed 18 August 1976', 'The last sample return from the Moon until Chang\u2019e 5 in 2020'] },
  { id: 'voyager', name: 'Voyager 1 & 2', agency: 'us', date: '1977-08-20', types: ['deep'], outcome: 'success',
    summary: 'Twin probes launched in 1977, a reminder that the lunar story sits inside a much larger one.',
    facts: ['Voyager 2 visited Jupiter, Saturn, Uranus and Neptune', 'Voyager 1 entered interstellar space in 2012, Voyager 2 in 2018', 'Each carries a Golden Record of sounds and images from Earth'] },
  { id: 'clementine', name: 'Clementine', agency: 'us', date: '1994-02-19', types: ['orbiter'], outcome: 'success',
    summary: 'A joint Pentagon\u2013NASA technology demonstration that mapped the Moon in many wavelengths and hinted at ice near the poles.',
    facts: ['Reached lunar orbit 19 February 1994', 'The first US lunar mission in over two decades'] },
  { id: 'lunar-prospector', name: 'Lunar Prospector', agency: 'us', date: '1998-01-06', types: ['orbiter', 'impactor'], outcome: 'success',
    summary: 'A low-cost orbiter whose neutron spectrometer found hydrogen-rich deposits at both poles, a sign of water ice.',
    facts: ['Launched 6 January 1998', 'Ended with a planned crash near the south pole on 31 July 1999'] },
  { id: 'smart-1', name: 'SMART-1', agency: 'europe', date: '2004-11-15', types: ['orbiter', 'impactor'], outcome: 'success',
    site: { name: 'Lacus Excellentiae (end of mission)', lat: -34.4, lon: -46.2, approx: true },
    summary: "Europe's first lunar mission, and a demonstration of solar-electric ion propulsion.",
    facts: ['Entered lunar orbit in November 2004', 'Ended with a planned impact on 3 September 2006'] },
  { id: 'kaguya', name: 'Kaguya (SELENE)', agency: 'japan', date: '2007-10-04', types: ['orbiter', 'impactor'], outcome: 'success',
    summary: "Japan's large lunar orbiter, delivering high-definition imagery, topography and gravity data.",
    facts: ['Launched 14 September 2007; entered lunar orbit on 4 October', 'Ended with a controlled impact in June 2009'] },
  { id: 'change-1', name: 'Chang\u2019e 1', agency: 'china', date: '2007-10-24', types: ['orbiter', 'impactor'], outcome: 'success',
    summary: "China's first lunar mission: an orbiter that produced a full-Moon stereo map.",
    facts: ['Launched 24 October 2007', 'Ended with a controlled impact on 1 March 2009'] },
  { id: 'chandrayaan-1', name: 'Chandrayaan-1', agency: 'india', date: '2008-11-08', types: ['orbiter', 'impactor'], outcome: 'success',
    summary: "India's first lunar probe. It released an impact probe and helped reveal widespread traces of surface water.",
    facts: ['Entered lunar orbit 8 November 2008', 'Its Moon Impact Probe struck near the south pole on 14 November', 'Contact was lost on 29 August 2009'] },
  { id: 'lro', name: 'Lunar Reconnaissance Orbiter', agency: 'us', date: '2009-06-23', types: ['orbiter'], outcome: 'success',
    summary: 'NASA\u2019s long-lived mapping orbiter, and the source of most high-resolution imagery used for landing-site planning.',
    facts: ['Launched 18 June 2009 alongside LCROSS', 'Its cameras documented the Apollo sites, and later crash sites'] },
  { id: 'lcross', name: 'LCROSS', agency: 'us', date: '2009-10-09', types: ['impactor'], outcome: 'success',
    site: { name: 'Cabeus crater', lat: -84.7, lon: -48.7 },
    summary: 'A spent rocket stage, then a shepherding spacecraft, were crashed into permanently shadowed Cabeus crater to look for water.',
    facts: ['Impact on 9 October 2009', 'The debris plume contained water, confirmed in November 2009'] },
  { id: 'change-3', name: 'Chang\u2019e 3', agency: 'china', date: '2013-12-14', types: ['lander', 'rover'], outcome: 'success',
    site: { name: 'Mare Imbrium', lat: 44.12, lon: -19.51 },
    summary: "China's first soft landing, and the first on the Moon since 1976. It deployed the Yutu rover.",
    facts: ['Landed 14 December 2013', 'Made China the third country to soft-land on the Moon'] },
  { id: 'change-4', name: 'Chang\u2019e 4', agency: 'china', date: '2019-01-03', types: ['lander', 'rover'], outcome: 'success',
    site: { name: 'Von K\u00e1rm\u00e1n crater, far side', lat: -45.46, lon: 177.59 },
    summary: "The first soft landing on the Moon's far side, supported by a relay satellite.",
    facts: ['Landed 3 January 2019 inside the South Pole\u2013Aitken basin', 'Rover Yutu-2 and the Queqiao relay satellite'] },
  { id: 'beresheet', name: 'Beresheet', agency: 'private', date: '2019-04-11', types: ['lander'], outcome: 'lost',
    site: { name: 'Mare Serenitatis (crash site)', lat: 32.6, lon: 19.35, approx: true },
    summary: "The first privately funded lunar landing attempt, built by Israel's SpaceIL.",
    facts: ['Crashed 11 April 2019 after its main engine failed during descent', 'Still reached lunar orbit, a first for a privately funded craft'] },
  { id: 'chandrayaan-2', name: 'Chandrayaan-2', agency: 'india', date: '2019-09-07', types: ['orbiter'], outcome: 'partial',
    site: { name: 'Vikram impact site (approx.)', lat: -70.88, lon: 22.78, approx: true },
    summary: 'An orbiter that reached the Moon and returned data, while its Vikram lander lost contact during final descent.',
    facts: ['Vikram lost contact about 2 km above the surface on 7 September 2019', 'The attempt set up the success of Chandrayaan-3'] },
  { id: 'change-5', name: 'Chang\u2019e 5', agency: 'china', date: '2020-12-01', types: ['lander', 'sample'], outcome: 'success',
    site: { name: 'Mons R\u00fcmker region', lat: 43.06, lon: -51.92 },
    summary: 'The first lunar sample return in 44 years.',
    facts: ['Landed 1 December 2020', 'About 1.73 kg of samples returned on 17 December', 'The samples were among the youngest lunar rocks ever dated'] },
  { id: 'artemis-1', name: 'Artemis I', agency: 'us', date: '2022-11-21', types: ['flyby', 'orbiter'], outcome: 'success',
    summary: 'The uncrewed Orion test flight that proved the Space Launch System and the capsule heat shield on a lunar trajectory.',
    facts: ['Launched 16 November 2022; splashed down 11 December', 'Passed about 130 km above the surface, then entered a distant retrograde orbit', 'Flew farther from Earth than any spacecraft built for humans at the time'] },
  { id: 'hakuto-r', name: 'Hakuto-R Mission 1', agency: 'private', date: '2023-04-25', types: ['lander'], outcome: 'lost',
    site: { name: 'Atlas crater (crash site)', lat: 47.6, lon: 44.1, approx: true },
    summary: "ispace's first lunar landing attempt, lost moments from touchdown.",
    facts: ['Crashed 25 April 2023 after misjudging its altitude and running out of fuel', 'The first commercial attempt to land on the Moon'] },
  { id: 'luna-25', name: 'Luna 25', agency: 'ussr', date: '2023-08-19', types: ['lander'], outcome: 'lost',
    site: { name: 'Impact site, near Pontanus', lat: -57.87, lon: 61.36, approx: true },
    summary: "Russia's first lunar mission in 47 years, lost when an orbital manoeuvre went wrong.",
    facts: ['Crashed 19 August 2023', 'Its impact crater was later imaged by NASA\u2019s LRO'] },
  { id: 'chandrayaan-3', name: 'Chandrayaan-3', agency: 'india', date: '2023-08-23', types: ['lander', 'rover'], outcome: 'success',
    site: { name: 'Shiv Shakti Point', lat: -69.37, lon: 32.32 },
    summary: "India's south-polar-region landing, which made it the fourth country to soft-land on the Moon.",
    facts: ['Landed 23 August 2023 near 69\u00b0 S', 'Pragyan rover deployed', 'Landing site named Shiv Shakti Point'] },
  { id: 'slim', name: 'SLIM', agency: 'japan', date: '2024-01-19', types: ['lander'], outcome: 'success',
    site: { name: 'Shioli crater', lat: -13.32, lon: 25.25 },
    summary: "Japan's pinpoint lander, which made the country the fifth to soft-land on the Moon.",
    facts: ['Landed 19 January 2024', 'Touched down within about 100 m of its target', 'Came to rest tilted, yet its instruments operated'] },
  { id: 'im-1', name: 'IM-1 Odysseus', agency: 'private', date: '2024-02-22', types: ['lander'], outcome: 'partial',
    site: { name: 'Malapert A', lat: -80.13, lon: 1.44 },
    summary: 'The first US landing since Apollo 17 and the first by a commercial company.',
    facts: ['Landed 22 February 2024', 'Tipped onto its side at touchdown, which limited operations'] },
  { id: 'change-6', name: 'Chang\u2019e 6', agency: 'china', date: '2024-06-01', types: ['lander', 'sample'], outcome: 'success',
    site: { name: 'Apollo basin, far side', lat: -41.64, lon: -153.99 },
    summary: "The first samples ever returned from the Moon's far side.",
    facts: ['Landed 1 June 2024', 'About 1.9 kg returned on 25 June 2024'] },
  { id: 'blue-ghost-1', name: 'Blue Ghost Mission 1', agency: 'private', date: '2025-03-02', types: ['lander'], outcome: 'success',
    site: { name: 'Mare Crisium', lat: 18.56, lon: 61.81 },
    summary: 'The first fully successful commercial lunar landing.',
    facts: ['Landed 2 March 2025', 'Operated through a full lunar day'] },
  { id: 'im-2', name: 'IM-2 Athena', agency: 'private', date: '2025-03-06', types: ['lander'], outcome: 'partial',
    site: { name: 'Near Mons Mouton', lat: -84.8, lon: 29.2, approx: true },
    summary: 'Landed closer to the south pole than any previous lander, but came to rest on its side.',
    facts: ['Landed 6 March 2025', 'Operations were cut short by its tilted position'] },
  { id: 'artemis-2', name: 'Artemis II', agency: 'us', date: '2026-04-06', types: ['crewed', 'flyby'], outcome: 'success',
    crew: ['Reid Wiseman', 'Victor Glover', 'Christina Koch', 'Jeremy Hansen'],
    summary: 'The first crewed lunar mission in more than fifty years: a ten-day flight around the far side of the Moon.',
    facts: ['Launched 1 April 2026; splashed down 10 April', 'Reached 406,771 km from Earth, a new distance record for humans', 'Koch, Glover and Hansen are the first woman, first Black astronaut and first non-US citizen on a lunar mission'] },
  { id: 'artemis-3', name: 'Artemis III', agency: 'us', date: '2027-06-01', dateNote: 'Target: 2027', types: ['crewed'], outcome: 'planned',
    crew: ['Crew to be announced'],
    summary: 'Re-planned as a crewed Earth-orbit rehearsal: Orion docking with one or both commercial lunar landers.',
    facts: ['Targeted for 2027', 'The landing attempt has moved to Artemis IV'] },
  { id: 'change-7', name: 'Chang\u2019e 7', agency: 'china', date: '2027-03-01', dateNote: 'Target: 2027', types: ['orbiter', 'lander', 'rover'], outcome: 'planned',
    site: { name: 'Shackleton crater rim (approx.)', lat: -89.5, lon: 0, approx: true },
    summary: "China's south-pole prospector: an orbiter, lander, rover and hopping probe aimed at water ice near Shackleton crater.",
    facts: ['Launch postponed to 2027 (announced 23 August 2026)', 'The hopper is designed to look into permanently shadowed ground'] },
  { id: 'blue-moon-mk1', name: 'Blue Moon MK1 \u201cEndurance\u201d', agency: 'private', date: '2027-04-01', dateNote: 'Target: 2027', types: ['lander'], outcome: 'planned',
    site: { name: 'Shackleton connecting ridge (approx.)', lat: -89.4, lon: 120, approx: true },
    summary: "Blue Origin's first lunar lander: a pathfinder cargo landing near the south pole.",
    facts: ['Reported as targeting early 2027', 'Its schedule depends on the New Glenn rocket returning to flight'] },
  { id: 'artemis-4', name: 'Artemis IV', agency: 'us', date: '2028-06-01', dateNote: 'No earlier than 2028', types: ['crewed', 'lander'], outcome: 'planned',
    site: { name: 'South polar region (site to be selected)', lat: -87, lon: 240, approx: true },
    crew: ['Crew to be announced'],
    summary: 'The first planned landing of the Artemis era: two astronauts near the lunar south pole.',
    facts: ['No earlier than 2028', 'A crew of two is planned to land'] },
]

export function yearFraction(iso: string): number {
  const d = new Date(`${iso}T12:00:00Z`)
  const y = d.getUTCFullYear()
  return y + (d.getTime() - Date.UTC(y, 0, 1)) / (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1))
}

export const MISSIONS: Mission[] = RAW.map((r) => ({ ...r, t: yearFraction(r.date) })).sort((a, b) => a.t - b.t)
export const MISSION_BY_ID = new Map(MISSIONS.map((m) => [m.id, m]))

export const TODAY = yearFraction(new Date().toISOString().slice(0, 10))
export const LATEST_ID = MISSIONS.filter((m) => m.t <= TODAY && m.outcome !== 'planned').at(-1)?.id ?? null

const DATE_FMT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
const MONTH_FMT = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })

export function formatDate(m: Mission): string {
  return m.dateNote ?? DATE_FMT.format(new Date(`${m.date}T12:00:00Z`))
}

export function formatCursor(t: number): string {
  if (Math.abs(t - TODAY) < 0.004) return 'Today'
  const y = Math.floor(t)
  const ms = Date.UTC(y, 0, 1) + (t - y) * (Date.UTC(y + 1, 0, 1) - Date.UTC(y, 0, 1))
  return MONTH_FMT.format(new Date(ms))
}

export function formatCoord(lat: number, lon: number, approx?: boolean): string {
  const l = ((lon + 540) % 360) - 180
  const d = approx ? 1 : 2
  return `${Math.abs(lat).toFixed(d)}\u00b0 ${lat < 0 ? 'S' : 'N'} \u00b7 ${Math.abs(l).toFixed(d)}\u00b0 ${l < 0 ? 'W' : 'E'}`
}
