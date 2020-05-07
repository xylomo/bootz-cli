import React, { Component } from 'react';
 
class ErrorBoundary extends Component {
  componentDidCatch(error, stackTrace) {
    console.error('Something bad happened!', error, stackTrace);
  }

  static getDerivedStateFromError() {
    return (<div>Failed to load :(</div>)
  }
 
  render() {
    return this.props.children;
  }
}
 
export default ErrorBoundary;