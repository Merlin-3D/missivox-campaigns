import { useState } from 'react'
import { router, usePage, useForm } from '@inertiajs/react'
import {
  CalendarClock,
  CircleAlert,
  Copy,
  Info,
  MailCheck,
  Send,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import Page from '~/components/page'
import AppLayout from '~/layouts/app'
import { urlFor } from '~/client'
import Modal from '~/components/modal'
import ListPicker from '~/components/list_picker'
import ConfirmAction from '~/components/confirm_action'
import MergeTagMenu from '~/components/merge_tag_menu'
import EmailPreview from '~/components/email_preview'
import EmailEditor, { type EditorMode } from '~/components/email_editor'
import { type Data } from '@generated/data'
import { type InertiaProps } from '~/types'
import type { ReadinessReport } from '~/lib/server_types'
import { formatDateTime, plural, toDateTimeLocal } from '~/lib/format'

type Props = InertiaProps<{
  campaign: Data.Campaign
  lists: Data.List.Variants['withCounts'][]
  readiness: ReadinessReport
}>

function TestDialog({
  campaignId,
  open,
  onClose,
}: {
  campaignId: number
  open: boolean
  onClose: () => void
}) {
  const { user } = usePage().props
  const form = useForm({ emails: user?.email ?? '' })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Envoyer un test"
      description="Le test part tel quel, avec « [TEST] » devant l'objet. Il n'est pas compté dans les statistiques."
    >
      <div className="stack">
        <div className="field">
          <label className="field__label" htmlFor="test-emails">
            Adresses
          </label>
          <input
            id="test-emails"
            className="field__input"
            value={form.data.emails}
            onChange={(event) => form.setData('emails', event.target.value)}
            aria-invalid={form.errors.emails ? 'true' : 'false'}
            autoFocus
          />
          {form.errors.emails ? (
            <span className="field__error">{form.errors.emails}</span>
          ) : (
            <span className="field__hint">
              Jusqu’à 5 adresses, séparées par des virgules. Une adresse qui appartient à un contact
              reçoit ses informations, les autres celles d’un contact fictif.
            </span>
          )}
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', paddingBottom: 18 }}>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn--primary"
            disabled={form.processing || !form.data.emails.trim()}
            onClick={() =>
              form.post(urlFor('campaign_actions.test', { id: campaignId }), {
                preserveScroll: true,
                onSuccess: () => onClose(),
              })
            }
          >
            {form.processing ? 'Envoi…' : 'Envoyer le test'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function SendDialog({
  campaignId,
  readiness,
  open,
  onClose,
}: {
  campaignId: number
  readiness: ReadinessReport
  open: boolean
  onClose: () => void
}) {
  const [when, setWhen] = useState<'now' | 'later'>('now')
  const [sendAt, setSendAt] = useState(() => {
    const date = new Date(Date.now() + 60 * 60 * 1000)
    date.setMinutes(0, 0, 0)
    return toDateTimeLocal(date)
  })
  const [processing, setProcessing] = useState(false)
  const blocked = readiness.problems.length > 0

  const send = () => {
    router.post(
      urlFor('campaign_actions.schedule', { id: campaignId }),
      when === 'later' ? { sendAt: new Date(sendAt).toISOString() } : {},
      {
        onStart: () => setProcessing(true),
        onFinish: () => setProcessing(false),
      }
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={blocked ? 'Encore un détail' : `Envoyer à ${plural(readiness.audience, 'contact')}`}
      wide
      footer={
        <>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {blocked ? 'Revenir à la campagne' : 'Annuler'}
          </button>
          {!blocked && (
            <button type="button" className="btn btn--primary" onClick={send} disabled={processing}>
              {when === 'now' ? <Send size={15} /> : <CalendarClock size={15} />}
              {processing
                ? 'Un instant…'
                : when === 'now'
                  ? 'Envoyer maintenant'
                  : `Programmer pour le ${formatDateTime(new Date(sendAt).toISOString())}`}
            </button>
          )}
        </>
      }
    >
      <div className="stack">
        {readiness.problems.length > 0 && (
          <div className="alert alert--danger">
            <CircleAlert size={16} />
            <ul>
              {readiness.problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </div>
        )}
        {readiness.warnings.length > 0 && (
          <div className="alert alert--warn">
            <TriangleAlert size={16} />
            <ul>
              {readiness.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
        {!blocked && (
          <>
            <div className="list-picker">
              <label className="check">
                <input type="radio" checked={when === 'now'} onChange={() => setWhen('now')} />
                <span className="check__text">
                  Maintenant
                  <span className="check__hint">
                    Les emails partent au rythme défini dans les réglages.
                  </span>
                </span>
              </label>
              <label className="check">
                <input type="radio" checked={when === 'later'} onChange={() => setWhen('later')} />
                <span className="check__text">
                  Plus tard
                  <span className="check__hint">
                    Vous pourrez repasser la campagne en brouillon d’ici là.
                  </span>
                </span>
              </label>
            </div>
            {when === 'later' && (
              <div className="field" style={{ maxWidth: 280 }}>
                <label className="field__label" htmlFor="send-at">
                  Date et heure d’envoi
                </label>
                <input
                  id="send-at"
                  type="datetime-local"
                  className="field__input"
                  value={sendAt}
                  min={toDateTimeLocal(new Date())}
                  onChange={(event) => setSendAt(event.target.value)}
                />
              </div>
            )}
            <p className="field__hint">
              Les contacts ajoutés aux listes après le départ ne recevront pas cette campagne.
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}

export default function CampaignEdit({ campaign, lists, readiness }: Props) {
  const [dialog, setDialog] = useState<'test' | 'send' | null>(null)
  const form = useForm({
    name: campaign.name,
    subject: campaign.subject,
    preheader: campaign.preheader ?? '',
    fromName: campaign.fromName,
    fromEmail: campaign.fromEmail,
    replyTo: campaign.replyTo ?? '',
    editor: campaign.editor as EditorMode,
    body: campaign.body,
    listIds: (campaign.lists ?? []).map((list) => list.id),
    trackOpens: campaign.trackOpens,
    trackClicks: campaign.trackClicks,
  })
  const errors = form.errors as Record<string, string | undefined>

  /**
   * Saves pending changes first, then runs the action, so tests and sends
   * always use what is on screen.
   */
  const saveThen = (next?: () => void) => {
    if (!form.isDirty) return next?.()
    form.put(urlFor('campaigns.update', { id: campaign.id }), {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        form.setDefaults()
        next?.()
      },
    })
  }

  /**
   * The exact audience comes from the server for the saved lists. While the
   * selection is being changed, only an upper bound is known: a contact in
   * two lists is counted twice here but receives one email.
   */
  const savedListIds = (campaign.lists ?? []).map((list) => list.id)
  const selectionIsSaved =
    savedListIds.length === form.data.listIds.length &&
    savedListIds.every((id) => form.data.listIds.includes(id))
  const audienceLabel = selectionIsSaved
    ? `${plural(readiness.audience, 'contact inscrit recevra', 'contacts inscrits recevront')} cet email.`
    : `Jusqu’à ${plural(
        lists
          .filter((list) => form.data.listIds.includes(list.id))
          .reduce((total, list) => total + list.subscribedCount, 0),
        'contact inscrit',
        'contacts inscrits'
      )}. Le nombre exact s’affiche après l’enregistrement.`

  return (
    <Page
      title={form.data.name || campaign.name}
      description={
        <span className="row" style={{ gap: 8 }}>
          <span className="badge">Brouillon</span>
          {form.isDirty
            ? 'Modifications non enregistrées'
            : `Enregistré le ${formatDateTime(campaign.updatedAt)}`}
        </span>
      }
      back={{ href: urlFor('campaigns.index'), label: 'Campagnes' }}
      width="wide"
      actions={
        <>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => saveThen()}
            disabled={!form.isDirty || form.processing}
          >
            {form.processing ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => saveThen(() => setDialog('test'))}
          >
            <MailCheck size={16} /> Tester
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => saveThen(() => setDialog('send'))}
          >
            <Send size={16} /> Envoyer
          </button>
        </>
      }
    >
      <div className="composer">
        <div className="steps">
          <section className="panel">
            <header className="panel__header">
              <div>
                <h2 className="panel__title">Email</h2>
                <p className="panel__description">
                  Ce que vos contacts voient dans leur boîte de réception.
                </p>
              </div>
            </header>
            <div className="stack">
              <div className="field">
                <div className="row row--between">
                  <label className="field__label" htmlFor="subject">
                    Objet
                  </label>
                  <MergeTagMenu
                    align="right"
                    onPick={(tag) => form.setData('subject', `${form.data.subject}${tag}`)}
                  />
                </div>
                <input
                  id="subject"
                  className="field__input"
                  value={form.data.subject}
                  onChange={(event) => form.setData('subject', event.target.value)}
                  aria-invalid={errors.subject ? 'true' : 'false'}
                  maxLength={255}
                />
                {errors.subject && <span className="field__error">{errors.subject}</span>}
              </div>
              <div className="field">
                <label className="field__label" htmlFor="preheader">
                  Texte d’aperçu <span className="field__optional">(facultatif)</span>
                </label>
                <input
                  id="preheader"
                  className="field__input"
                  value={form.data.preheader}
                  onChange={(event) => form.setData('preheader', event.target.value)}
                  maxLength={255}
                />
                <span className="field__hint">
                  Affiché après l’objet dans la plupart des messageries. Une phrase qui donne envie
                  d’ouvrir.
                </span>
              </div>
              <div className="fields-row--3 fields-row">
                <div className="field">
                  <label className="field__label" htmlFor="fromName">
                    Nom de l’expéditeur
                  </label>
                  <input
                    id="fromName"
                    className="field__input"
                    value={form.data.fromName}
                    onChange={(event) => form.setData('fromName', event.target.value)}
                    aria-invalid={errors.fromName ? 'true' : 'false'}
                  />
                  {errors.fromName && <span className="field__error">{errors.fromName}</span>}
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="fromEmail">
                    Adresse d’envoi
                  </label>
                  <input
                    id="fromEmail"
                    type="email"
                    className="field__input"
                    value={form.data.fromEmail}
                    onChange={(event) => form.setData('fromEmail', event.target.value)}
                    aria-invalid={errors.fromEmail ? 'true' : 'false'}
                  />
                  {errors.fromEmail && <span className="field__error">{errors.fromEmail}</span>}
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="replyTo">
                    Réponses à <span className="field__optional">(facultatif)</span>
                  </label>
                  <input
                    id="replyTo"
                    type="email"
                    className="field__input"
                    value={form.data.replyTo}
                    onChange={(event) => form.setData('replyTo', event.target.value)}
                    aria-invalid={errors.replyTo ? 'true' : 'false'}
                  />
                  {errors.replyTo && <span className="field__error">{errors.replyTo}</span>}
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <header className="panel__header">
              <div>
                <h2 className="panel__title">Destinataires</h2>
                <p className="panel__description">
                  {form.data.listIds.length === 0
                    ? 'Choisissez au moins une liste.'
                    : audienceLabel}
                </p>
              </div>
            </header>
            <ListPicker
              lists={lists}
              value={form.data.listIds}
              onChange={(value) => form.setData('listIds', value)}
            />
            {errors.listIds && <span className="field__error">{errors.listIds}</span>}
          </section>

          <section>
            <EmailEditor
              mode={form.data.editor}
              value={form.data.body}
              onChange={(body) => form.setData('body', body)}
              onModeChange={(mode) => form.setData('editor', mode)}
            />
            {errors.body && <span className="field__error">{errors.body}</span>}
          </section>

          <section className="panel">
            <header className="panel__header">
              <div>
                <h2 className="panel__title">Suivi</h2>
                <p className="panel__description">Pour savoir qui a lu et ce qui a intéressé.</p>
              </div>
            </header>
            <div className="stack" style={{ gap: 12 }}>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.data.trackOpens}
                  onChange={(event) => form.setData('trackOpens', event.target.checked)}
                />
                <span className="check__text">
                  Compter les ouvertures
                  <span className="check__hint">
                    Une image invisible est ajoutée. Certaines messageries la bloquent : le chiffre
                    est une estimation basse.
                  </span>
                </span>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={form.data.trackClicks}
                  onChange={(event) => form.setData('trackClicks', event.target.checked)}
                />
                <span className="check__text">
                  Compter les clics
                  <span className="check__hint">
                    Les liens passent par Missivox avant d’arriver à destination.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="row">
              <ConfirmAction
                url={urlFor('campaigns.duplicate', { id: campaign.id })}
                title="Dupliquer la campagne ?"
                description="Une copie en brouillon est créée avec le même contenu et les mêmes listes. Pensez à enregistrer avant."
                confirmLabel="Dupliquer"
                className="btn btn--ghost btn--sm"
              >
                <Copy size={15} /> Dupliquer
              </ConfirmAction>
              <ConfirmAction
                url={urlFor('campaigns.destroy', { id: campaign.id })}
                method="delete"
                title="Supprimer ce brouillon ?"
                description="Le contenu de la campagne sera perdu."
                confirmLabel="Supprimer"
                danger
                className="btn btn--danger-ghost btn--sm"
              >
                <Trash2 size={15} /> Supprimer
              </ConfirmAction>
            </div>
            <span className="field__hint row" style={{ gap: 6 }}>
              <Info size={14} /> Le pied de page avec le lien de désinscription est ajouté
              automatiquement.
            </span>
          </div>
        </div>

        <div className="composer__preview">
          <EmailPreview
            fromName={form.data.fromName}
            subject={form.data.subject}
            preheader={form.data.preheader || null}
            editor={form.data.editor}
            body={form.data.body}
            openUrl={urlFor('previews.campaign', { id: campaign.id })}
          />
        </div>
      </div>

      <TestDialog
        campaignId={campaign.id}
        open={dialog === 'test'}
        onClose={() => setDialog(null)}
      />
      <SendDialog
        campaignId={campaign.id}
        readiness={readiness}
        open={dialog === 'send'}
        onClose={() => setDialog(null)}
      />
    </Page>
  )
}

CampaignEdit.layout = [AppLayout]
