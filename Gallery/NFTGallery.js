import { useEffect, useState } from "react";
import { ethers } from "ethers";
import CertificateNFTAbi from "./CertificateNFT.json";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const RPC_URL = process.env.REACT_APP_BSC_RPC;

function NFTGallery() {
  // ✅ Define all states BEFORE using them
  const [nfts, setNFTs] = useState([]); // all NFTs fetched
  const [filteredNFTs, setFilteredNFTs] = useState([]); // NFTs after search/filter
  const [search, setSearch] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterGrade, setFilterGrade] = useState("");

  useEffect(() => {
    async function fetchNFTs() {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(contractAddress, CertificateNFTAbi, provider);

        const total = await contract.totalSupply();
        const items = [];

        for (let i = 0; i < total; i++) {
          const tokenUri = await contract.tokenURI(i);
          const metadataUrl = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
          const res = await fetch(metadataUrl);
          const metadata = await res.json();

          const imageUrl = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
          const attributes = {};
          if (metadata.attributes) {
            metadata.attributes.forEach(attr => {
              attributes[attr.trait_type] = attr.value;
            });
          }

          items.push({
            tokenId: i,
            name: metadata.name || `Token #${i}`,
            image: imageUrl,
            attributes,
          });
        }

        setNFTs(items); // ✅ now it exists
        setFilteredNFTs(items);
      } catch (err) {
        console.error("Error fetching NFTs:", err);
      }
    }

    fetchNFTs();
  }, []);

  // Filtering logic
  useEffect(() => {
    const filtered = nfts.filter(nft => {
      const matchesSearch =
        nft.attributes.Graduate?.toLowerCase().includes(search.toLowerCase()) ||
        nft.name.toLowerCase().includes(search.toLowerCase());
      const matchesProgram = filterProgram ? nft.attributes.Program === filterProgram : true;
      const matchesGrade = filterGrade ? nft.attributes.Grade === filterGrade : true;
      return matchesSearch && matchesProgram && matchesGrade;
    });
    setFilteredNFTs(filtered);
  }, [search, filterProgram, filterGrade, nfts]);

  const programs = [...new Set(nfts.map(nft => nft.attributes.Program).filter(Boolean))];
  const grades = [...new Set(nfts.map(nft => nft.attributes.Grade).filter(Boolean))];

  return (
    <div style={{ padding: "20px" }}>
      <h1>My NFT Certificates</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by Graduate or Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "5px", marginRight: "10px" }}
        />
        <select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)} style={{ padding: "5px", marginRight: "10px" }}>
          <option value="">All Programs</option>
          {programs.map((program, idx) => <option key={idx} value={program}>{program}</option>)}
        </select>
        <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} style={{ padding: "5px" }}>
          <option value="">All Grades</option>
          {grades.map((grade, idx) => <option key={idx} value={grade}>{grade}</option>)}
        </select>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {filteredNFTs.map((nft) => (
          <div key={nft.tokenId} style={{ margin: 10, textAlign: "center", border: "1px solid #ccc", padding: 10, borderRadius: 10 }}>
            <img src={nft.image} alt={nft.name} width={200} />
            <h3>{nft.name}</h3>
            {nft.attributes.Graduate && <p><strong>Graduate:</strong> {nft.attributes.Graduate}</p>}
            {nft.attributes.Program && <p><strong>Program:</strong> {nft.attributes.Program}</p>}
            {nft.attributes.Grade && <p><strong>Grade:</strong> {nft.attributes.Grade}</p>}
            {nft.attributes.Year && <p><strong>Year:</strong> {nft.attributes.Year}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NFTGallery;
