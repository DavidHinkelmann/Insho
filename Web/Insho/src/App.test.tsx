import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App.tsx'

describe('App', () => {
  test('renders CTA button', () => {
    render(<App />)
    expect(screen.getByText('Loslegen')).toBeDefined()
  })
})
