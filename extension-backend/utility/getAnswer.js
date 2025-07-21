import { RetrievalQAChain } from "langchain/chains";

export const getAnswer = async (question, llm, retriever) => {
  try {
    // Create a QA chain that uses the LLM and retriever
    const chain = RetrievalQAChain.fromLLM(llm, retriever);

    // Find relevant documents
    const relevantDocs = await retriever.getRelevantDocuments(question);
    if (!relevantDocs || relevantDocs.length === 0) {
      return "Not relevant question";
    }

    // Run the chain to get the answer
    const answer = await chain.call({ query: question });
    return answer.text || "No answer found.";
  } catch (error) {
    console.error("Error in getAnswer:", error);
    throw error;
  }
};
