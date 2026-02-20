import React from 'react';

const LibraryPage = () => {
  const resources = [
    {
      id: 1,
      title: "AI Fundamentals",
      category: "Tutorial",
      description: "Learn the basics of artificial intelligence and machine learning.",
      difficulty: "Beginner"
    },
    {
      id: 2,
      title: "Natural Language Processing",
      category: "Guide",
      description: "Master NLP techniques for text analysis and generation.",
      difficulty: "Intermediate"
    },
    {
      id: 3,
      title: "Computer Vision Advanced",
      category: "Documentation",
      description: "Deep dive into computer vision algorithms and applications.",
      difficulty: "Advanced"
    },
    {
      id: 4,
      title: "Neural Networks",
      category: "Tutorial",
      description: "Understanding deep learning and neural network architectures.",
      difficulty: "Intermediate"
    },
    {
      id: 5,
      title: "AI Ethics & Responsibility",
      category: "Guide",
      description: "Best practices for ethical AI development and deployment.",
      difficulty: "Beginner"
    },
    {
      id: 6,
      title: "Model Deployment",
      category: "Documentation",
      description: "Deploy your AI models to production environments.",
      difficulty: "Advanced"
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Tutorial':
        return 'bg-blue-100 text-blue-800';
      case 'Guide':
        return 'bg-purple-100 text-purple-800';
      case 'Documentation':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-grow bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Resource Library</h1>
          <p className="text-lg">
            Explore our comprehensive collection of AI resources, tutorials, and documentation
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search resources..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option value="tutorial">Tutorial</option>
              <option value="guide">Guide</option>
              <option value="documentation">Documentation</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{resource.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{resource.description}</p>
              
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(resource.category)}`}>
                  {resource.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(resource.difficulty)}`}>
                  {resource.difficulty}
                </span>
              </div>
              
              <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                View Resource
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              3
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;