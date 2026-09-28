// Shared interactive video presets for Evergreen LMS

export const DEMO_PRESET_MANIFEST = {
  videoTitle: 'Lecture: Software Engineering & Modular Architecture',
  videoSrc: '/demo-video.mp4',
  videoName: 'classroom-lecture.mp4 (Classroom Lecture — 32.8s)',
  duration: '00:33',
  interactions: [
    {
      id: 'edu-hotspot-1',
      type: 'hotspot',
      title: 'Lecture Slide: Modular Systems',
      startTime: 3,
      endTime: 9,
      x: 28.5,
      y: 32.0,
      action: 'info',
      content: 'Prof. Davis discusses loose coupling, interface abstraction, and single responsibility principles in scalable software systems.',
      url: ''
    },
    {
      id: 'edu-hotspot-2',
      type: 'hotspot',
      title: 'Course Reference: W3C Media Specifications',
      startTime: 7,
      endTime: 15,
      x: 74.0,
      y: 46.0,
      action: 'link',
      content: 'Official specifications for HTML5 video playback, client event loops, and streaming mechanics.',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement'
    },
    {
      id: 'edu-branch-1',
      type: 'branching',
      title: 'Learning Track: Select Your Lecture Focus',
      description: 'The lecture has paused at an architectural milestone. Choose whether to explore blackboard theoretical derivation or jump straight to the practical live coding laboratory.',
      triggerTime: 16,
      options: [
        {
          id: 'b-opt-theory',
          label: 'Track A: Architectural Theory & Modeling (Jump to 00:18)',
          jumpTo: 18,
          description: 'Explore formal structural derivation and blackboard system flow'
        },
        {
          id: 'b-opt-lab',
          label: 'Track B: Practical Live Coding Lab (Jump to 00:26)',
          jumpTo: 26,
          description: 'Fast-forward directly into the hands-on code demonstration'
        }
      ]
    },
    {
      id: 'edu-quiz-1',
      type: 'quiz',
      title: 'Comprehension Check: Software Modularity',
      triggerTime: 24,
      question: 'What is the primary architectural advantage of maintaining loose coupling between software modules?',
      choices: [
        { id: 'q-1', text: 'Modules can be developed, tested, and scaled independently with minimal risk of cascading failures', isCorrect: true },
        { id: 'q-2', text: 'It forces all operations to execute sequentially on a single CPU thread', isCorrect: false },
        { id: 'q-3', text: 'It completely eliminates the need for unit testing or type safety', isCorrect: false }
      ],
      feedback: {
        correct: 'Spot on! Loose coupling minimizes interdependencies, allowing components to evolve, test, and scale safely.',
        incorrect: 'Not quite. Loose coupling ensures that modifications in one module do not break dependent subsystems.'
      }
    }
  ]
};
