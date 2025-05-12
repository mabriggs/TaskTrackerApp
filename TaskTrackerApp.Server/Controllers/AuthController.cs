using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TaskTrackerApp.Server;

namespace ReactApp.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IOptions<JwtSettings> jwtOptions,
    UserManager<IdentityUser> userManager) : ControllerBase
{
    public class LoginRequest
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
    }

    public class RegisterRequest
    {
        public required string Username { get; set; }
        public required string Password { get; set; }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await userManager.FindByNameAsync(request.Username);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        var result = await userManager.CheckPasswordAsync(user, request.Password);
        if (!result)
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        var token = await GenerateJwtToken(user);

        return Ok(new
        {
            token,
            user = new
            {
                user.Id,
                user.UserName
            }
        });
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var user = new IdentityUser
        {
            UserName = request.Username
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return BadRequest(new { message = result.Errors.First().Description });
        }

        var token = await GenerateJwtToken(user);

        return Ok(new
        {
            token,
            user = new
            {
                user.Id,
                user.UserName
            }
        });
    }

    private async Task<string> GenerateJwtToken(IdentityUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.UserName)
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Value.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtOptions.Value.Issuer,
            audience: jwtOptions.Value.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtOptions.Value.DurationInMinutes)),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}