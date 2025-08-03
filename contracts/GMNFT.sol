// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GMNft
 * @dev ERC721 NFT contract that allows users to mint one NFT per day
 */
contract GMNft is ERC721, Ownable {
    uint256 private _tokenIds;
    
    // Mapping to track last mint time for each user
    mapping(address => uint256) private _lastMintTime;
    
    // Daily minting cooldown (24 hours in seconds)
    uint256 public constant DAILY_COOLDOWN = 60;
    
    // Maximum supply of NFTs
    uint256 public maxSupply;
    
    // Base URI for token metadata
    string private _baseTokenURI;
    
    // Events
    event NFTMinted(address indexed to, uint256 indexed tokenId);
    event BaseURIUpdated(string newBaseURI);
    
    /**
     * @dev Constructor
     * @param _name Name of the NFT collection
     * @param _symbol Symbol of the NFT collection
     * @param _maxSupply Maximum number of NFTs that can be minted
     * @param _initialOwner Initial owner of the contract
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        address _initialOwner
    ) ERC721(_name, _symbol) Ownable(_initialOwner) {
        maxSupply = _maxSupply;
    }
    
    /**
     * @dev Mint a new NFT. Can only be called once per day per user.
     */
    function mint() external {
        require(_tokenIds < maxSupply, "GMNFT: Max supply reached");
        require(canMint(msg.sender), "GMNFT: Daily mint limit reached");
        
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        
        _mint(msg.sender, newTokenId);
        _lastMintTime[msg.sender] = block.timestamp;
        
        emit NFTMinted(msg.sender, newTokenId);
    }
    
    /**
     * @dev Check if a user can mint (hasn't minted in the last 24 hours)
     * @param user Address to check
     * @return True if user can mint, false otherwise
     */
    function canMint(address user) public view returns (bool) {
        uint256 lastMint = _lastMintTime[user];
        return lastMint == 0 || block.timestamp >= lastMint + DAILY_COOLDOWN;
    }
    
    /**
     * @dev Get the time remaining until a user can mint again
     * @param user Address to check
     * @return Time remaining in seconds, 0 if can mint now
     */
    function getTimeUntilNextMint(address user) external view returns (uint256) {
        uint256 lastMint = _lastMintTime[user];
        if (lastMint == 0) return 0;
        
        uint256 nextMintTime = lastMint + DAILY_COOLDOWN;
        if (block.timestamp >= nextMintTime) return 0;
        
        return nextMintTime - block.timestamp;
    }
    
    /**
     * @dev Get the last mint time for a user
     * @param user Address to check
     * @return Timestamp of last mint, 0 if never minted
     */
    function getLastMintTime(address user) external view returns (uint256) {
        return _lastMintTime[user];
    }
    
    /**
     * @dev Get current token ID counter
     * @return Current token ID
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIds;
    }
    
    /**
     * @dev Set the base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }
    
    /**
     * @dev Get the base URI for token metadata
     * @return Base URI string
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Get token URI for a specific token
     * @param tokenId ID of the token
     * @return Token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseURI(), _toString(tokenId)));
    }
    
    /**
     * @dev Convert uint256 to string
     * @param value Number to convert
     * @return String representation
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        
        return string(buffer);
    }
    
} 