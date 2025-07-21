
import { TextLoader } from "langchain/document_loaders/fs/text";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FakeEmbeddings } from "langchain/embeddings/fake";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";
import dotenv from "dotenv";

dotenv.config();

export const getRetriever = async (textFilePath) => {
  const loader = new TextLoader(textFilePath);
  const documents = await loader.load();
  // console.log("Text file loaded, number of documents:", documents.length);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 900,
    chunkOverlap: 300,
  });
  const splitDocs = await splitter.splitDocuments(documents);
  // console.log("Number of chunks after splitting:", splitDocs.length);

  const embeddings = new FakeEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
  );

  const retriever = vectorStore.asRetriever();
  return retriever;
};
