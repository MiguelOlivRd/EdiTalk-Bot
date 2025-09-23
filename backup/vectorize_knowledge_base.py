import streamlit as sl
import os
import time

from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv

from langchain_community.embeddings import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


load_dotenv()


def load_llm():
    from langchain_openai import ChatOpenAI
    llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)
    return llm

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


def extract_data():
    text_chunks = []
    files = filter(lambda f: f.lower().endswith(".txt"), os.listdir("editais"))
    file_list = list(files)
    print(file_list)
    for file in file_list:
        print("--------------------------\nfile: ", file)
        loader = TextLoader(os.path.join('uploaded', file))
        text_chunks += loader.load_and_split(text_splitter=RecursiveCharacterTextSplitter(
            chunk_size = 512,
            chunk_overlap = 30,
            length_function = len,
            separators= ["\n\n", "\n", ".", " "]
        ))
    vectorstore = FAISS.from_documents(documents=text_chunks, embedding=embeddings)
    return vectorstore

def initialize_session_state():
    if "knowledge_base" not in sl.session_state:
        sl.session_state["knowledge_base"] = None

def save_uploadedfile(uploadedfile):
    with open(os.path.join("uploaded", uploadedfile.name), "wb") as f:
        f.write(uploadedfile.getbuffer())



if __name__ == '__main__':
    extract_data()
    with sl.sidebar:
        with sl.form("my-form", clear_on_submit=True):
            pdf_docs = sl.file_uploader(label="Faça o Upload do seu PDF:", accept_multiple_files=True, type=["pdf"])
            submitted = sl.form_submit_button("Processar")
        
        if submitted and pdf_docs != []:
            initialize_session_state()
            for pdf in pdf_docs:
                save_uploadedfile(pdf)
            sl.session_state.knowledge_base = extract_data()
            # remove_files()
            pdf_docs = []

            alert = sl.success(body=f"Realizado o Upload do PDF com Sucesso!", icon="✅")
            time.sleep(3) 
            alert.empty()

    sl.header("Bem-vindo ao PDF Chat")
    