const CourseIdPage = ({ params }: { params: { courseId: string } }) => {
  return (
    <div>
      <p>course id page -{params.courseId}</p>
    </div>
  );
};

export default CourseIdPage;
