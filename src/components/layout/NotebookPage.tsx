import './notebook-page.css'

interface NotebookPageProps {
  children: React.ReactNode
}

export default function NotebookPage({ children }: NotebookPageProps) {
  return (
    <div className="notebook-page">
      <main className="notebook-page__desk">
        <div className="notebook-page__paper">
          <div className="notebook-page__margin-rule" />
          <div className="notebook-page__content">
            {children}
          </div>
          <p className="notebook-page__page-number">— 1 —</p>
        </div>
      </main>
    </div>
  )
}
