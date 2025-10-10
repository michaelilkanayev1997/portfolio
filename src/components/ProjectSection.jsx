const ProjectSection = ({ title, children, titleClassName, contentClassName }) => {
  if (!children) return null;

  return (
    <div className="my-8">
      <h2
        className={`text-yellow-100 text-2xl sm:text-3xl font-bold mb-4 border-b-4 border-gray-500 inline-block z-10 ${titleClassName}`}
      >
        {title}
      </h2>
      <div className={contentClassName}>{children}</div>
    </div>
  );
};

export default ProjectSection;
