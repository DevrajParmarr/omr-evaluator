"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("OMR Evaluator crashed:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main role="alert" style={{ padding: "2rem", maxWidth: 480, margin: "0 auto" }}>
          <h1>Something went wrong</h1>
          <p>
            This screen hit an unexpected error. Your saved records are untouched. Try reloading the
            page.
          </p>
        </main>
      );
    }
    return this.props.children;
  }
}
