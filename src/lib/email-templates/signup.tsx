import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email address to activate your Right2Privacy account</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>
            Right<span style={brandAccent}>2</span>Privacy
          </Text>
          <Text style={tagline}>Privacy is a human right.</Text>
        </Section>

        <Section style={card}>
          <Heading style={h1}>Confirm your email address</Heading>
          <Text style={text}>
            An account was created on{' '}
            <Link href={siteUrl} style={link}>
              right2privacy.at
            </Link>{' '}
            using <strong style={strong}>{recipient}</strong>. Confirm this address to activate the
            account and generate your encryption keys.
          </Text>
          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              Confirm email address
            </Button>
          </Section>
          <Text style={smallText}>
            If the button doesn't work, copy this link into your browser:
            <br />
            <Link href={confirmationUrl} style={rawLink}>
              {confirmationUrl}
            </Link>
          </Text>
        </Section>

        <Section style={noteBox}>
          <Text style={noteText}>
            Your messages and private keys are encrypted in your browser. Right2Privacy never sees
            your plaintext, your password, or your private key.
          </Text>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          If you didn't create this account, you can safely ignore this email — nothing will be
          activated.
        </Text>
        <Text style={footerBrand}>
          Right2Privacy · <Link href={siteUrl} style={footerLink}>right2privacy.at</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  padding: '24px 0',
}
const container = { maxWidth: '560px', margin: '0 auto', padding: '0 20px' }
const header = { padding: '0 0 20px', textAlign: 'center' as const }
const brand = {
  color: '#0f172a',
  fontWeight: 'bold' as const,
  fontSize: '20px',
  letterSpacing: '-0.02em',
  margin: '0',
}
const brandAccent = { color: '#16a34a' }
const tagline = {
  color: '#64748b',
  fontSize: '12px',
  margin: '4px 0 0',
  letterSpacing: '0.02em',
}
const card = {
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '28px 26px',
  backgroundColor: '#ffffff',
}
const h1 = {
  fontSize: '20px',
  fontWeight: 'bold' as const,
  color: '#0f172a',
  margin: '0 0 14px',
}
const text = {
  fontSize: '14px',
  color: '#475569',
  lineHeight: '1.6',
  margin: '0 0 22px',
}
const strong = { color: '#0f172a' }
const link = { color: '#16a34a', textDecoration: 'underline' }
const buttonWrap = { margin: '0 0 20px' }
const button = {
  backgroundColor: '#16a34a',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  borderRadius: '8px',
  padding: '13px 22px',
  textDecoration: 'none',
  display: 'inline-block',
}
const smallText = {
  fontSize: '12px',
  color: '#94a3b8',
  lineHeight: '1.5',
  margin: '0',
  wordBreak: 'break-all' as const,
}
const rawLink = { color: '#16a34a', textDecoration: 'underline', fontSize: '12px' }
const noteBox = {
  border: '1px solid #dcfce7',
  backgroundColor: '#f0fdf4',
  borderRadius: '10px',
  padding: '14px 16px',
  margin: '16px 0 0',
}
const noteText = { fontSize: '12px', color: '#166534', lineHeight: '1.5', margin: '0' }
const hr = { borderColor: '#e2e8f0', margin: '24px 0 16px' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: '0 0 8px' }
const footerBrand = { fontSize: '11px', color: '#cbd5e1', margin: '0' }
const footerLink = { color: '#94a3b8', textDecoration: 'underline' }
