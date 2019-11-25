import ReactMarkdown from 'react-markdown'

const VersionIntroduce = props => {
  const { projectDesc } = props
  return (
    <ReactMarkdown source={projectDesc} />
  );
}

export default VersionIntroduce
