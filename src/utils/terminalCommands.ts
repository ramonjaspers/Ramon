import { profile } from '../data/profile'
import { formatYears } from './formatYears'

export interface TerminalCommandResult {
  lines: string[]
  href?: string
  linkLabel?: string
  isError?: boolean
  action?: 'open-cv'
}

export const resolveTerminalCommand = (
  command: string,
): TerminalCommandResult => {
  switch (command.toLowerCase()) {
    case 'help':
      return {
        lines: [
          'about       a short introduction',
          'skills      technologies and experience',
          'experience  recent roles',
          'contact     email Ramon',
          'github      open the source profile',
          'cv          open the full CV',
          'clear       clear this session',
        ],
      }
    case 'about':
    case 'whoami':
      return {
        lines: [profile.name, profile.role, profile.location, profile.headline],
      }
    case 'skills':
      return {
        lines: profile.skills.map(
          (skill) => `${skill.name.padEnd(18)} ${formatYears(skill.years)}`,
        ),
      }
    case 'experience':
      return {
        lines: profile.experience
          .slice(0, 5)
          .map((job) => `${job.period}  ${job.role} @ ${job.company}`),
      }
    case 'contact':
      return {
        lines: ['Open a new message to:'],
        href: `mailto:${profile.email}`,
        linkLabel: profile.email,
      }
    case 'github':
      return {
        lines: ['Source, experiments, and contributions:'],
        href: profile.socials.github,
        linkLabel: 'github.com/ramonjaspers',
      }
    case 'cv':
      return { lines: ['Opening the full CV...'], action: 'open-cv' }
    case 'ls':
      return { lines: ['about/  experience/  skills/  contact/  cv/'] }
    default:
      return {
        isError: true,
        lines: [
          `command not found: ${command}`,
          'Try "help" to see available commands.',
        ],
      }
  }
}
