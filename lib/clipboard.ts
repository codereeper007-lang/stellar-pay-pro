export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    // We'll dispatch a custom event so the global toast system can pick it up
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { type: 'success', message: 'Copied to clipboard!' } 
    }))
  } catch (err) {
    window.dispatchEvent(new CustomEvent('toast', { 
      detail: { type: 'error', message: 'Failed to copy' } 
    }))
  }
}
