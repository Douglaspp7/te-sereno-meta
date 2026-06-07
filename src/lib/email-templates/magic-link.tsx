import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Bienvenido a MiReto21 - Accede a tu plan personalizado</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h2}>Bienvenido a MiReto21</Heading>

        <Text style={text}>
          Sigue este enlace para acceder a tu plan personalizado y transformar tu vida en 21 días:
        </Text>

        <Text style={text}>
          <Link href={confirmationUrl} style={link}>
            Hacer clic aquí para entrar
          </Link>
        </Text>

        <Hr style={hr} />

        <Text style={text}>
          Si tienes alguna duda o necesitas soporte directo con el creador, contáctame:
        </Text>

        <Text style={text}>
          🌐 Web:{' '}
          <Link href="https://www.mireto21.com" style={link}>
            www.mireto21.com
          </Link>
        </Text>

        <Text style={text}>📱 WhatsApp: +55 (13) 98875-1089</Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h2 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#000000',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.5',
  margin: '0 0 15px',
}
const link = {
  color: '#0066cc',
  textDecoration: 'underline',
}
const hr = {
  borderColor: '#e6e6e6',
  margin: '25px 0',
}
