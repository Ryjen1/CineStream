// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CineStream {
    string public constant name = "CineToken";
    string public constant symbol = "CTK";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;
    uint256 public constant TOKENS_PER_MOVIE = 10 * 10**18;

    struct Movie {
        string title;
        string description;
        string url;
        bool exists;
    }

    mapping(address => uint256) public balanceOf;
    mapping(string => Movie) public movies;
    mapping(address => mapping(string => bool)) public hasWatched;

    address public owner;
    bool private locked;

    event MovieAdded(string title, string description, string url);
    event MovieRemoved(string title);
    event TokensRewarded(address user, string title, uint256 amount);

    constructor() {
        owner = msg.sender;
        locked = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    function addMovie(string memory _title, string memory _description, string memory _url) 
        public 
        onlyOwner 
    {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(!movies[_title].exists, "Movie already exists");

        movies[_title] = Movie({
            title: _title,
            description: _description,
            url: _url,
            exists: true
        });

        emit MovieAdded(_title, _description, _url);
    }

    function removeMovie(string memory _title) 
        public 
        onlyOwner 
    {
        require(movies[_title].exists, "Movie does not exist");

        delete movies[_title];
        emit MovieRemoved(_title);
    }

    function watchMovie(string memory _title) 
        public 
        nonReentrant 
    {
        require(movies[_title].exists, "Movie does not exist");
        require(!hasWatched[msg.sender][_title], "Movie already watched by user");
        require(totalSupply + TOKENS_PER_MOVIE <= MAX_SUPPLY, "Max token supply exceeded");

        hasWatched[msg.sender][_title] = true;
        balanceOf[msg.sender] += TOKENS_PER_MOVIE;
        totalSupply += TOKENS_PER_MOVIE;

        emit TokensRewarded(msg.sender, _title, TOKENS_PER_MOVIE);
    }

    function getMovie(string memory _title) 
        public 
        view 
        returns (string memory title, string memory description, string memory url) 
    {
        require(movies[_title].exists, "Movie does not exist");
        Movie memory movie = movies[_title];
        return (movie.title, movie.description, movie.url);
    }

    // Test-only function to set totalSupply for max supply testing
    function setTotalSupplyForTest(uint256 _totalSupply) 
        public 
        onlyOwner 
    {
        require(_totalSupply <= MAX_SUPPLY, "Cannot set above max supply");
        totalSupply = _totalSupply;
    }
}