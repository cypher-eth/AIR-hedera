// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CREDIT
 * @dev ERC20 token contract for CREDIT tokens with built-in burning and tracking functionality
 */
contract CREDIT is ERC20, Ownable {
    
    // Mapping to track total CREDIT burned by each user
    mapping(address => uint256) public userBurnedCredits;
    
    // Total CREDIT burned across all users
    uint256 public totalBurnedCredits;
    
    // Operator system
    mapping(address => bool) public operators;
    address[] public operatorList;
    
    // Events
    event CreditsMinted(address indexed to, uint256 amount);
    event CreditsBurned(address indexed user, uint256 amount, uint256 userTotal, uint256 globalTotal);
    event OperatorAdded(address indexed operator);
    event OperatorRemoved(address indexed operator);
    event OperatorBurn(address indexed operator, address indexed user, uint256 amount, uint256 userTotal, uint256 globalTotal);
    
    // Modifier to restrict access to operators only
    modifier onlyOperator() {
        require(operators[msg.sender], "CREDIT: Caller is not an operator");
        _;
    }
    
    /**
     * @dev Constructor
     * @param _initialOwner Initial owner of the contract
     */
    constructor(address _initialOwner) ERC20("CREDIT", "CREDIT") Ownable(_initialOwner) {
        operators[_initialOwner] = true;
        operatorList.push(_initialOwner);
    }
    
    /**
     * @dev Mint CREDIT tokens to a specific address
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
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
     * @dev Add an operator (owner only)
     * @param operator Address to add as operator
     */
    function addOperator(address operator) external onlyOwner {
        require(operator != address(0), "CREDIT: Cannot add zero address as operator");
        require(!operators[operator], "CREDIT: Address is already an operator");
        
        operators[operator] = true;
        operatorList.push(operator);
        
        emit OperatorAdded(operator);
    }
    
    /**
     * @dev Remove an operator (owner only)
     * @param operator Address to remove as operator
     */
    function removeOperator(address operator) external onlyOwner {
        require(operators[operator], "CREDIT: Address is not an operator");
        
        operators[operator] = false;
        
        // Remove from operatorList
        for (uint i = 0; i < operatorList.length; i++) {
            if (operatorList[i] == operator) {
                operatorList[i] = operatorList[operatorList.length - 1];
                operatorList.pop();
                break;
            }
        }
        
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
     * @dev Get the list of all operators
     * @return Array of operator addresses
     */
    function getOperatorList() external view returns (address[] memory) {
        return operatorList;
    }
    
    /**
     * @dev Get the number of operators
     * @return Number of operators
     */
    function getOperatorCount() external view returns (uint256) {
        return operatorList.length;
    }
    
    /**
     * @dev Check if an address is an operator
     * @param operator Address to check
     * @return True if the address is an operator
     */
    function isOperator(address operator) external view returns (bool) {
        return operators[operator];
    }
} 