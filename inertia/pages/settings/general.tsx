import { type FormEvent } from 'react'
import { usePage, useForm } from '@inertiajs/react'
import { CircleCheck, Trash2, TriangleAlert } from 'lucide-react'
import AppLayout from '~/layouts/app'
import SettingsLayout from '~/layouts/settings'
import ConfirmAction from '~/components/confirm_action'
import { urlFor } from '~/client'
import { type InertiaProps } from '~/types'
import { formatRelative } from '~/lib/format'
import type { AppSettings, WorkerHealth } from '~/lib/server_types'

type SmtpServer = {
  host: string
  port: number
  secure: boolean
  username: string | null
  hasPassword: boolean
}

type Props = InertiaProps<{
  settings: AppSettings
  smtp: SmtpServer | null
  sharedServer: { host: string; port: number } | null
  appUrl: string
  worker: WorkerHealth
}>

export default function GeneralSettings({ settings, smtp, sharedServer, appUrl, worker }: Props) {
  const { user } = usePage().props
  const form = useForm({
    senderName: settings.senderName,
    senderEmail: settings.senderEmail,
    replyTo: settings.replyTo ?? '',
    companyName: settings.companyName,
    companyAddress: settings.companyAddress ?? '',
    sendRatePerMinute: settings.sendRatePerMinute,
  })
  const test = useForm({ email: user?.email ?? '' })
  const errors = form.errors as Record<string, string | undefined>
  const isLocalUrl = /localhost|127\.0\.0\.1/.test(appUrl)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    form.put(urlFor('settings.update'), { preserveScroll: true })
  }

  return (
    <div className="stack" style={{ gap: 20 }}>
      <form className="panel" onSubmit={submit} noValidate>
        <section className="section">
          <header className="section__header">
            <h2 className="section__title">Expéditeur par défaut</h2>
            <p className="section__description">
              Proposé à chaque nouvelle campagne. L’adresse doit appartenir à un domaine autorisé
              par votre serveur SMTP, sinon vos emails finiront en spam.
            </p>
          </header>
          <div className="section__body">
            <div className="fields-row">
              <div className="field">
                <label className="field__label" htmlFor="senderName">
                  Nom affiché
                </label>
                <input
                  id="senderName"
                  className="field__input"
                  value={form.data.senderName}
                  onChange={(event) => form.setData('senderName', event.target.value)}
                  aria-invalid={errors.senderName ? 'true' : 'false'}
                />
                {errors.senderName && <span className="field__error">{errors.senderName}</span>}
              </div>
              <div className="field">
                <label className="field__label" htmlFor="senderEmail">
                  Adresse d’envoi
                </label>
                <input
                  id="senderEmail"
                  type="email"
                  className="field__input"
                  value={form.data.senderEmail}
                  onChange={(event) => form.setData('senderEmail', event.target.value)}
                  aria-invalid={errors.senderEmail ? 'true' : 'false'}
                />
                {errors.senderEmail && <span className="field__error">{errors.senderEmail}</span>}
              </div>
            </div>
            <div className="field">
              <label className="field__label" htmlFor="replyTo">
                Adresse de réponse <span className="field__optional">(facultatif)</span>
              </label>
              <input
                id="replyTo"
                type="email"
                className="field__input"
                value={form.data.replyTo}
                onChange={(event) => form.setData('replyTo', event.target.value)}
                aria-invalid={errors.replyTo ? 'true' : 'false'}
              />
              {errors.replyTo ? (
                <span className="field__error">{errors.replyTo}</span>
              ) : (
                <span className="field__hint">
                  Si les réponses doivent arriver dans une autre boîte.
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="section">
          <header className="section__header">
            <h2 className="section__title">Pied de page des emails</h2>
            <p className="section__description">
              La loi impose d’indiquer qui envoie l’email et comment se désinscrire. Ces
              informations apparaissent en bas de chaque campagne.
            </p>
          </header>
          <div className="section__body">
            <div className="field">
              <label className="field__label" htmlFor="companyName">
                Nom de l’entreprise
              </label>
              <input
                id="companyName"
                className="field__input"
                value={form.data.companyName}
                onChange={(event) => form.setData('companyName', event.target.value)}
                aria-invalid={errors.companyName ? 'true' : 'false'}
              />
              {errors.companyName && <span className="field__error">{errors.companyName}</span>}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="companyAddress">
                Adresse postale <span className="field__optional">(recommandée)</span>
              </label>
              <textarea
                id="companyAddress"
                className="field__input"
                rows={3}
                value={form.data.companyAddress}
                onChange={(event) => form.setData('companyAddress', event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="section">
          <header className="section__header">
            <h2 className="section__title">Cadence d’envoi</h2>
            <p className="section__description">
              Envoyer doucement ménage la réputation de votre domaine et respecte les limites de
              votre fournisseur SMTP.
            </p>
          </header>
          <div className="section__body">
            <div className="field" style={{ maxWidth: 260 }}>
              <label className="field__label" htmlFor="sendRatePerMinute">
                Emails par minute
              </label>
              <input
                id="sendRatePerMinute"
                type="number"
                min={1}
                max={3000}
                className="field__input"
                value={form.data.sendRatePerMinute}
                onChange={(event) => form.setData('sendRatePerMinute', Number(event.target.value))}
                aria-invalid={errors.sendRatePerMinute ? 'true' : 'false'}
              />
              {errors.sendRatePerMinute ? (
                <span className="field__error">{errors.sendRatePerMinute}</span>
              ) : (
                <span className="field__hint">
                  {form.data.sendRatePerMinute > 0 &&
                    `1 000 emails partent en ${Math.ceil(1000 / form.data.sendRatePerMinute)} min environ.`}
                </span>
              )}
            </div>
          </div>
        </section>

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={form.processing || !form.isDirty}
          >
            {form.processing ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <SmtpPanel smtp={smtp} sharedServer={sharedServer} />

      <section className="panel">
        <header className="section__header">
          <h2 className="section__title">État de l’envoi</h2>
          <p className="section__description">
            Le service d’envoi fait partir les campagnes au rythme choisi plus haut.
          </p>
        </header>
        <dl className="kv" style={{ marginTop: 16 }}>
          <dt>Service d’envoi</dt>
          <dd>
            {worker.alive ? (
              <span className="badge badge--ok">Actif</span>
            ) : (
              <span className="badge badge--warn">Arrêté</span>
            )}
            {worker.lastBeatAt && (
              <span className="cell-sub">
                Dernier signe de vie {formatRelative(worker.lastBeatAt)}
              </span>
            )}
          </dd>
          <dt>Adresse publique</dt>
          <dd className="mono">{appUrl}</dd>
        </dl>

        {worker.error && (
          <div className="alert alert--danger" style={{ marginTop: 16 }}>
            <TriangleAlert size={16} />
            <div>{worker.error.message}</div>
          </div>
        )}
        {isLocalUrl && (
          <div className="alert alert--warn" style={{ marginTop: 16 }}>
            <TriangleAlert size={16} />
            <div>
              L’adresse publique pointe vers cet ordinateur : chez vos destinataires, les liens de
              désinscription et le suivi ne fonctionneront pas. Renseignez l’adresse réelle du site
              dans <code className="mono">APP_URL</code> avant d’envoyer pour de vrai.
            </div>
          </div>
        )}

        <div className="field" style={{ marginTop: 20 }}>
          <label className="field__label" htmlFor="smtp-test">
            Vérifier l’envoi
          </label>
          <div className="row" style={{ flexWrap: 'nowrap' }}>
            <input
              id="smtp-test"
              type="email"
              className="field__input"
              value={test.data.email}
              onChange={(event) => test.setData('email', event.target.value)}
              aria-invalid={test.errors.email ? 'true' : 'false'}
              style={{ maxWidth: 320 }}
            />
            <button
              type="button"
              className="btn btn--secondary"
              disabled={test.processing || (!smtp && !sharedServer)}
              onClick={() => test.post(urlFor('settings.test_smtp'), { preserveScroll: true })}
            >
              <CircleCheck size={15} /> {test.processing ? 'Envoi…' : 'Envoyer un email de test'}
            </button>
          </div>
          {test.errors.email && <span className="field__error">{test.errors.email}</span>}
        </div>
      </section>
    </div>
  )
}

GeneralSettings.layout = [AppLayout, SettingsLayout]

/**
 * The SMTP server of the workspace. The saved password is never sent back
 * to the browser: leaving the field empty keeps it.
 */
function SmtpPanel({
  smtp,
  sharedServer,
}: {
  smtp: SmtpServer | null
  sharedServer: { host: string; port: number } | null
}) {
  const form = useForm({
    host: smtp?.host ?? '',
    port: smtp?.port ?? 587,
    secure: smtp?.secure ?? false,
    username: smtp?.username ?? '',
    password: '',
  })
  const errors = form.errors as Record<string, string | undefined>

  const submit = (event: FormEvent) => {
    event.preventDefault()
    form.put(urlFor('settings.update_smtp'), {
      preserveScroll: true,
      onSuccess: () => form.setData('password', ''),
    })
  }

  return (
    <form className="panel" onSubmit={submit} noValidate>
      <header className="section__header">
        <h2 className="section__title">Serveur d’envoi (SMTP)</h2>
        <p className="section__description">
          Vos campagnes partent par le serveur de votre messagerie ou de votre service d’emailing.
          Votre hébergeur fournit ces réglages (Hostinger, OVH, Gmail, Brevo…).
        </p>
      </header>

      {!smtp && !sharedServer && (
        <div className="alert alert--warn" style={{ marginTop: 16 }}>
          <TriangleAlert size={16} />
          <div>Aucun serveur d’envoi : vos campagnes ne peuvent pas partir pour l’instant.</div>
        </div>
      )}
      {!smtp && sharedServer && (
        <div className="alert alert--info" style={{ marginTop: 16 }}>
          <div>
            Sans serveur à vous, vos emails passent par celui de cette installation (
            <span className="mono">
              {sharedServer.host}:{sharedServer.port}
            </span>
            ).
          </div>
        </div>
      )}

      <div className="section__body" style={{ marginTop: 16 }}>
        <div className="fields-row">
          <div className="field">
            <label className="field__label" htmlFor="smtpHost">
              Serveur
            </label>
            <input
              id="smtpHost"
              className="field__input mono"
              placeholder="smtp.hostinger.com"
              autoComplete="off"
              value={form.data.host}
              onChange={(event) => form.setData('host', event.target.value)}
              aria-invalid={errors.host ? 'true' : 'false'}
            />
            {errors.host && <span className="field__error">{errors.host}</span>}
          </div>
          <div className="field" style={{ maxWidth: 140 }}>
            <label className="field__label" htmlFor="smtpPort">
              Port
            </label>
            <input
              id="smtpPort"
              type="number"
              min={1}
              max={65535}
              className="field__input"
              value={form.data.port}
              onChange={(event) => form.setData('port', Number(event.target.value))}
              aria-invalid={errors.port ? 'true' : 'false'}
            />
            {errors.port && <span className="field__error">{errors.port}</span>}
          </div>
        </div>

        <label className="check">
          <input
            type="checkbox"
            checked={form.data.secure}
            onChange={(event) => form.setData('secure', event.target.checked)}
          />
          <span className="check__text">
            Connexion chiffrée dès le départ (SSL)
            <span className="check__hint">
              À cocher pour le port 465. Laissez décoché pour le port 587.
            </span>
          </span>
        </label>

        <div className="fields-row">
          <div className="field">
            <label className="field__label" htmlFor="smtpUsername">
              Identifiant
            </label>
            <input
              id="smtpUsername"
              className="field__input"
              placeholder="no-reply@votre-domaine.fr"
              autoComplete="off"
              value={form.data.username}
              onChange={(event) => form.setData('username', event.target.value)}
              aria-invalid={errors.username ? 'true' : 'false'}
            />
            {errors.username && <span className="field__error">{errors.username}</span>}
          </div>
          <div className="field">
            <label className="field__label" htmlFor="smtpPassword">
              Mot de passe
            </label>
            <input
              id="smtpPassword"
              type="password"
              className="field__input"
              autoComplete="new-password"
              placeholder={smtp?.hasPassword ? 'Enregistré, laissez vide pour le garder' : ''}
              value={form.data.password}
              onChange={(event) => form.setData('password', event.target.value)}
              aria-invalid={errors.password ? 'true' : 'false'}
            />
            {errors.password ? (
              <span className="field__error">{errors.password}</span>
            ) : (
              <span className="field__hint">Conservé chiffré.</span>
            )}
          </div>
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 24, gap: 8 }}>
        {smtp && (
          <ConfirmAction
            url={urlFor('settings.destroy_smtp')}
            method="delete"
            title="Supprimer le serveur d’envoi ?"
            description="Vos campagnes ne pourront plus partir tant qu’un autre serveur n’est pas renseigné."
            confirmLabel="Supprimer"
            danger
            className="btn btn--ghost"
          >
            <Trash2 size={15} /> Supprimer
          </ConfirmAction>
        )}
        <button type="submit" className="btn btn--primary" disabled={form.processing}>
          {form.processing ? 'Enregistrement…' : 'Enregistrer le serveur'}
        </button>
      </div>
    </form>
  )
}
