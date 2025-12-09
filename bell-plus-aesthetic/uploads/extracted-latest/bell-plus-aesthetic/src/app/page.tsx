'use client'

import React from 'react'

class Home extends React.Component {
  state = {
    mounted: false
  };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  render() {
    const { mounted } = this.state;

    if (!mounted) {
      return <div className="bg-[#151718] h-screen w-screen"></div>;
    }

    return (
      <div className="relative min-h-screen overflow-x-hidden">
        <main className="relative">
          <section className="min-h-screen flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Bell Timer</h1>
            <p className="mt-4 text-xl">A bell timer for the Ardis G. Egan Junior High School schedule</p>
          </section>
        </main>
      </div>
    );
  }
}

export default Home;
