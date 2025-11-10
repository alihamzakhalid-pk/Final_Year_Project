const IconBase = ({ children, size = 20, strokeWidth = 1.6, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={size}
    height={size}
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
)

export const MenuIcon = (props) => (
  <IconBase {...props}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </IconBase>
)

export const CloseIcon = (props) => (
  <IconBase {...props}>
    <path d="m6 6 12 12" />
    <path d="m18 6-12 12" />
  </IconBase>
)

export const ChevronDownIcon = (props) => (
  <IconBase {...props}>
    <path d="m6 9 6 6 6-6" />
  </IconBase>
)

export const MoonIcon = (props) => (
  <IconBase {...props}>
    <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z" />
  </IconBase>
)

export const SunIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m4.93 19.07 1.41-1.41" />
    <path d="m17.66 6.34 1.41-1.41" />
  </IconBase>
)

export const SparklesIcon = (props) => (
  <IconBase {...props}>
    <path d="M10 2v4" />
    <path d="m12.24 4.76-1.48 1.48" />
    <path d="m7.76 4.76 1.48 1.48" />
    <path d="M14 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
    <path d="M18 7v3" />
    <path d="m19.5 8.5-1 1" />
    <path d="m16.5 8.5 1 1" />
    <path d="M20 15v4" />
    <path d="M22 17h-4" />
  </IconBase>
)

export const ClockIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l2.5 2.5" />
  </IconBase>
)

export const MessageSquareIcon = (props) => (
  <IconBase {...props}>
    <path d="M4 16.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4.5Z" />
  </IconBase>
)

export const FileTextIcon = (props) => (
  <IconBase {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8" />
    <path d="M8 17h5" />
  </IconBase>
)

export const UploadCloudIcon = (props) => (
  <IconBase {...props}>
    <path d="M16 16l-4-4-4 4" />
    <path d="M12 12v9" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 4 16.3" />
  </IconBase>
)

export const MicIcon = (props) => (
  <IconBase {...props}>
    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10a7 7 0 0 1-14 0" />
    <path d="M12 19v3" />
  </IconBase>
)

export const PaperclipIcon = (props) => (
  <IconBase {...props}>
    <path d="M21.44 11.05 12.12 20.37a5 5 0 0 1-7.07-7.07l10.61-10.61a3.5 3.5 0 0 1 4.95 4.95L9.41 18.84a2 2 0 0 1-2.83-2.83L15.3 7.29" />
  </IconBase>
)

export const SendIcon = (props) => (
  <IconBase {...props}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="m22 2-11 11" />
  </IconBase>
)

export const MailIcon = (props) => (
  <IconBase {...props}>
    <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
    <path d="m4 8 8 5 8-5" />
  </IconBase>
)

export const LockIcon = (props) => (
  <IconBase {...props}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <path d="M12 16v2" />
  </IconBase>
)

export const UserIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M6 20a6 6 0 0 1 12 0" />
  </IconBase>
)

export const ShieldCheckIcon = (props) => (
  <IconBase {...props}>
    <path d="M12 3 4 6v6c0 5.25 3.4 9.74 8 11 4.6-1.26 8-5.75 8-11V6Z" />
    <path d="m9 12 2 2 4-4" />
  </IconBase>
)

