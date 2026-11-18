import './style.scss';

export const GrayTitle = ({children}: {children: React.ReactNode}) => (
    <span className="gray-title">{children}</span>
)

export const BlueTitle = ({children, className}: {children: React.ReactNode, className?: string}) => (
    <span className={`blue-title ${className}`}>{children}</span>
)

export const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="section-label">
        <span className="section-line" />
            {children}
        <span className="section-line" />
    </p>
)

export const SectionHeading = ({grayTitle, blueTitle}: {grayTitle: string, blueTitle: string}) => (
    <h2 className="section-heading">
        <GrayTitle>
            {grayTitle}
        </GrayTitle>
        <br />
        <BlueTitle>
            {blueTitle}
        </BlueTitle>
    </h2>
)