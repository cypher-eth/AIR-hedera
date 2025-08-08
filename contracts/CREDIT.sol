// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CREDIT
 * @dev ERC20 token contract for CREDIT tokens with built-in burning and tracking functionality
 */
contract CREDIT is ERC20, Ownable, AccessControl {
    
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    // Mapping to track total CREDIT burned by each user
    mapping(address => uint256) public userBurnedCredits;
    
    // Total CREDIT burned across all users
    uint256 public totalBurnedCredits;
    
    // Events
    event CreditsMinted(address indexed to, uint256 amount);
    event CreditsBurned(address indexed user, uint256 amount, uint256 userTotal, uint256 globalTotal);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event OperatorAdded(address indexed operator);
    event OperatorRemoved(address indexed operator);
    event OperatorBurn(address indexed operator, address indexed user, uint256 amount, uint256 userTotal, uint256 globalTotal);
    
    // Modifier to restrict access to minters only
    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, msg.sender), "CREDIT: Caller is not a minter");
        _;
    }
    
    // Modifier to restrict access to operators only
    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "CREDIT: Caller is not an operator");
        _;
    }
    
    /**
     * @dev Constructor
     * @param _initialOwner Initial owner of the contract
     */
    constructor(address _initialOwner) ERC20("CREDIT", "CREDIT") Ownable(_initialOwner) {
        // Grant roles to the initial owner
        _grantRole(DEFAULT_ADMIN_ROLE, _initialOwner);
        _grantRole(MINTER_ROLE, _initialOwner);
        _grantRole(OPERATOR_ROLE, _initialOwner);
    }
    
    /**
     * @dev Mint CREDIT tokens to a specific address (minter only)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
        emit CreditsMinted(to, amount);
    }
    
    /**
     * @dev Burn tokens from caller
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Burn tokens from a specific address (owner only)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
    
    /**
     * @dev Burn CREDIT tokens and track the amount (replaces WATER contract functionality)
     * @param amount Amount of CREDIT tokens to burn
     */
    function burnCredits(uint256 amount) external {
        require(amount > 0, "CREDIT: Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "CREDIT: Insufficient CREDIT balance");
        
        // Burn the CREDIT tokens directly
        _burn(msg.sender, amount);
        
        // Update tracking
        userBurnedCredits[msg.sender] += amount;
        totalBurnedCredits += amount;
        
        emit CreditsBurned(msg.sender, amount, userBurnedCredits[msg.sender], totalBurnedCredits);
    }
    
    /**
     * @dev Add a minter (owner only)
     * @param minter Address to add as minter
     */
    function addMinter(address minter) external onlyOwner {
        require(minter != address(0), "CREDIT: Cannot add zero address as minter");
        require(!hasRole(MINTER_ROLE, minter), "CREDIT: Address is already a minter");
        
        _grantRole(MINTER_ROLE, minter);
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove a minter (owner only)
     * @param minter Address to remove as minter
     */
    function removeMinter(address minter) external onlyOwner {
        require(hasRole(MINTER_ROLE, minter), "CREDIT: Address is not a minter");
        
        _revokeRole(MINTER_ROLE, minter);
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Add an operator (owner only)
     * @param operator Address to add as operator
     */
    function addOperator(address operator) external onlyOwner {
        require(operator != address(0), "CREDIT: Cannot add zero address as operator");
        require(!hasRole(OPERATOR_ROLE, operator), "CREDIT: Address is already an operator");
        
        _grantRole(OPERATOR_ROLE, operator);
        emit OperatorAdded(operator);
    }
    
    /**
     * @dev Remove an operator (owner only)
     * @param operator Address to remove as operator
     */
    function removeOperator(address operator) external onlyOwner {
        require(hasRole(OPERATOR_ROLE, operator), "CREDIT: Address is not an operator");
        
        _revokeRole(OPERATOR_ROLE, operator);
        emit OperatorRemoved(operator);
    }
    
    /**
     * @dev Operator burn function - allows operators to burn tokens from any user
     * @param user Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function operatorBurn(address user, uint256 amount) external onlyOperator {
        require(amount > 0, "CREDIT: Amount must be greater than 0");
        require(balanceOf(user) >= amount, "CREDIT: Insufficient CREDIT balance");
        
        // Burn the CREDIT tokens from the specified user
        _burn(user, amount);
        
        // Update tracking
        userBurnedCredits[user] += amount;
        totalBurnedCredits += amount;
        
        emit OperatorBurn(msg.sender, user, amount, userBurnedCredits[user], totalBurnedCredits);
    }
    
    /**
     * @dev Get the total CREDIT burned by a specific user
     * @param user Address to check
     * @return Total CREDIT burned by the user
     */
    function getUserBurnedCredits(address user) external view returns (uint256) {
        return userBurnedCredits[user];
    }
    
    /**
     * @dev Get the total CREDIT burned across all users
     * @return Total CREDIT burned globally
     */
    function getTotalBurnedCredits() external view returns (uint256) {
        return totalBurnedCredits;
    }
    
    /**
     * @dev Check if an address is a minter
     * @param minter Address to check
     * @return True if the address is a minter
     */
    function isMinter(address minter) external view returns (bool) {
        return hasRole(MINTER_ROLE, minter);
    }
    
    /**
     * @dev Check if an address is an operator
     * @param operator Address to check
     * @return True if the address is an operator
     */
    function isOperator(address operator) external view returns (bool) {
        return hasRole(OPERATOR_ROLE, operator);
    }
    

    

    

} 