import { type ReactNode, useEffect, useRef, useState } from 'react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react'
import {
  AlignCenter,
  AlignLeft,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from 'lucide-react'
import Modal from '~/components/modal'
import MergeTagMenu from '~/components/merge_tag_menu'

export type EditorMode = 'visual' | 'html'

function ToolButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className="editor__btn"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

type UrlDialogProps = {
  open: boolean
  title: string
  initial: string
  hint: string
  onSubmit: (url: string) => void
  onRemove?: () => void
  onClose: () => void
}

/**
 * Asks for a URL, for links and images. The modal only renders its content
 * while open, so the field starts from `initial` each time.
 */
function UrlDialog({ open, title, onClose, ...props }: UrlDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <UrlField onClose={onClose} {...props} />
    </Modal>
  )
}

function UrlField({
  initial,
  hint,
  onSubmit,
  onRemove,
  onClose,
}: Omit<UrlDialogProps, 'open' | 'title'>) {
  const [value, setValue] = useState(initial)

  /**
   * Not a <form>: the editor itself may sit inside one.
   */
  const submit = () => value.trim() && onSubmit(value.trim())

  return (
    <div className="stack">
      <div className="field">
        <label className="field__label" htmlFor="editor-url">
          Adresse
        </label>
        <input
          id="editor-url"
          className="field__input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              submit()
            }
          }}
          placeholder="https://"
          autoFocus
        />
        <span className="field__hint">{hint}</span>
      </div>
      <div className="row" style={{ justifyContent: 'flex-end', paddingBottom: 18 }}>
        {onRemove && (
          <button type="button" className="btn btn--danger-ghost" onClick={onRemove}>
            Retirer le lien
          </button>
        )}
        <button type="button" className="btn btn--secondary" onClick={onClose}>
          Annuler
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={submit}
          disabled={!value.trim()}
        >
          Valider
        </button>
      </div>
    </div>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const [dialog, setDialog] = useState<'link' | 'image' | null>(null)
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive('bold'),
      italic: current.isActive('italic'),
      underline: current.isActive('underline'),
      strike: current.isActive('strike'),
      h1: current.isActive('heading', { level: 1 }),
      h2: current.isActive('heading', { level: 2 }),
      h3: current.isActive('heading', { level: 3 }),
      bulletList: current.isActive('bulletList'),
      orderedList: current.isActive('orderedList'),
      blockquote: current.isActive('blockquote'),
      link: current.isActive('link'),
      center: current.isActive({ textAlign: 'center' }),
      href: (current.getAttributes('link').href as string | undefined) ?? '',
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
    }),
  })

  const chain = () => editor.chain().focus()

  return (
    <div className="editor__toolbar" role="toolbar" aria-label="Mise en forme">
      <ToolButton label="Annuler" onClick={() => chain().undo().run()}>
        <Undo2 size={15} />
      </ToolButton>
      <ToolButton label="Rétablir" onClick={() => chain().redo().run()}>
        <Redo2 size={15} />
      </ToolButton>
      <span className="editor__sep" />
      <ToolButton
        label="Grand titre"
        active={state.h1}
        onClick={() => chain().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 size={16} />
      </ToolButton>
      <ToolButton
        label="Titre"
        active={state.h2}
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={16} />
      </ToolButton>
      <ToolButton
        label="Sous-titre"
        active={state.h3}
        onClick={() => chain().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={16} />
      </ToolButton>
      <span className="editor__sep" />
      <ToolButton label="Gras" active={state.bold} onClick={() => chain().toggleBold().run()}>
        <Bold size={15} />
      </ToolButton>
      <ToolButton
        label="Italique"
        active={state.italic}
        onClick={() => chain().toggleItalic().run()}
      >
        <Italic size={15} />
      </ToolButton>
      <ToolButton
        label="Souligné"
        active={state.underline}
        onClick={() => chain().toggleUnderline().run()}
      >
        <Underline size={15} />
      </ToolButton>
      <ToolButton label="Barré" active={state.strike} onClick={() => chain().toggleStrike().run()}>
        <Strikethrough size={15} />
      </ToolButton>
      <span className="editor__sep" />
      <ToolButton
        label="Liste à puces"
        active={state.bulletList}
        onClick={() => chain().toggleBulletList().run()}
      >
        <List size={16} />
      </ToolButton>
      <ToolButton
        label="Liste numérotée"
        active={state.orderedList}
        onClick={() => chain().toggleOrderedList().run()}
      >
        <ListOrdered size={16} />
      </ToolButton>
      <ToolButton
        label="Citation"
        active={state.blockquote}
        onClick={() => chain().toggleBlockquote().run()}
      >
        <Quote size={15} />
      </ToolButton>
      <ToolButton
        label={state.center ? 'Aligner à gauche' : 'Centrer'}
        active={state.center}
        onClick={() =>
          chain()
            .setTextAlign(state.center ? 'left' : 'center')
            .run()
        }
      >
        {state.center ? <AlignLeft size={15} /> : <AlignCenter size={15} />}
      </ToolButton>
      <span className="editor__sep" />
      <ToolButton label="Lien" active={state.link} onClick={() => setDialog('link')}>
        <LinkIcon size={15} />
      </ToolButton>
      <ToolButton label="Image" onClick={() => setDialog('image')}>
        <ImageIcon size={15} />
      </ToolButton>
      <ToolButton label="Séparateur" onClick={() => chain().setHorizontalRule().run()}>
        <Minus size={15} />
      </ToolButton>
      <span className="editor__sep" />
      <MergeTagMenu compact onPick={(tag) => chain().insertContent(tag).run()} />

      <UrlDialog
        open={dialog === 'link'}
        title={state.link ? 'Modifier le lien' : 'Ajouter un lien'}
        initial={state.href}
        hint="Sélectionnez d'abord le texte à transformer en lien. Les clics seront comptés."
        onClose={() => setDialog(null)}
        onRemove={
          state.link
            ? () => {
                chain().extendMarkRange('link').unsetLink().run()
                setDialog(null)
              }
            : undefined
        }
        onSubmit={(url) => {
          const href = /^(https?:|mailto:|tel:|\{\{)/i.test(url) ? url : `https://${url}`
          if (editor.state.selection.empty && !state.link) {
            chain().insertContent(`<a href="${href}">${href}</a>`).run()
          } else {
            chain().extendMarkRange('link').setLink({ href }).run()
          }
          setDialog(null)
        }}
      />
      <UrlDialog
        open={dialog === 'image'}
        title="Insérer une image"
        initial=""
        hint="L'image doit être en ligne (https://…) pour s'afficher chez vos destinataires."
        onClose={() => setDialog(null)}
        onSubmit={(src) => {
          chain().setImage({ src }).run()
          setDialog(null)
        }}
      />
    </div>
  )
}

function VisualEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    immediatelyRender: true,
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  })

  /**
   * Content replaced from outside (a template applied, a mode switch).
   */
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="editor__content" />
    </>
  )
}

function HtmlEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const insert = (text: string) => {
    const textarea = ref.current
    if (!textarea) return onChange(value + text)
    const { selectionStart, selectionEnd } = textarea
    onChange(value.slice(0, selectionStart) + text + value.slice(selectionEnd))
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(selectionStart + text.length, selectionStart + text.length)
    })
  }

  return (
    <>
      <div className="editor__toolbar">
        <MergeTagMenu compact onPick={insert} />
        <span className="field__hint" style={{ marginLeft: 8 }}>
          Collez un email complet ou un fragment HTML. Le pied de page légal est ajouté s’il manque
          le lien <code className="mono">{'{{ unsubscribe_url }}'}</code>.
        </span>
      </div>
      <textarea
        ref={ref}
        className="editor__html"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        aria-label="Code HTML de l'email"
      />
    </>
  )
}

/**
 * Email content editor with a visual mode (rich text) and an HTML mode.
 */
export default function EmailEditor({
  mode,
  value,
  onChange,
  onModeChange,
}: {
  mode: EditorMode
  value: string
  onChange: (html: string) => void
  onModeChange: (mode: EditorMode) => void
}) {
  const [confirmVisual, setConfirmVisual] = useState(false)

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row row--between">
        <div className="tabs" role="tablist" aria-label="Mode d'édition">
          <button
            type="button"
            role="tab"
            className="tabs__tab"
            aria-selected={mode === 'visual'}
            onClick={() => mode === 'html' && setConfirmVisual(true)}
          >
            Éditeur visuel
          </button>
          <button
            type="button"
            role="tab"
            className="tabs__tab"
            aria-selected={mode === 'html'}
            onClick={() => onModeChange('html')}
          >
            HTML
          </button>
        </div>
      </div>

      <div className="editor">
        {mode === 'visual' ? (
          <VisualEditor value={value} onChange={onChange} />
        ) : (
          <HtmlEditor value={value} onChange={onChange} />
        )}
      </div>

      <Modal
        open={confirmVisual}
        onClose={() => setConfirmVisual(false)}
        title="Repasser à l'éditeur visuel ?"
        description="L'éditeur visuel ne garde que le texte, les titres, les listes, les liens et les images. Les styles et la mise en page de votre HTML seront perdus."
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setConfirmVisual(false)}>
              Rester en HTML
            </button>
            <button
              className="btn btn--primary"
              onClick={() => {
                const body = value.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? value
                onChange(body.replace(/<style[\s\S]*?<\/style>/gi, ''))
                onModeChange('visual')
                setConfirmVisual(false)
              }}
            >
              Passer en visuel
            </button>
          </>
        }
      />
    </div>
  )
}
