import { SITE } from '../config/site'
import { IconGithub, IconX } from './SocialIcons'

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="font-bold text-lg">
              <span className="text-white">Git</span>
              <span className="text-primary">art</span>
            </span>
            <span className="text-xs text-muted-foreground">
              Build websites like you run commands.
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#contract" className="hover:text-foreground transition-colors">
              CA
            </a>
            <a href="#commands" className="hover:text-foreground transition-colors">
              Docs
            </a>
            <a
              href={SITE.social.github || SITE.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <IconGithub className="w-4 h-4" />
              GitHub
            </a>
            <a
              href={SITE.social.x}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <IconX className="w-3.5 h-3.5" />
              X
            </a>
            <a
              href={SITE.domain}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              gitart.xyz
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          <p>Built on RobinHood. Powered by AI.</p>
        </div>
      </div>
    </footer>
  )
}
